/* Dark Python editor with PyCharm-style colors and a console. */

const PY_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/"
const CM_BASE = "https://cdn.jsdelivr.net/npm/codemirror@5.65.18/"

let pythonBuilt = false
let pythonEditor = null
let pythonConsole = null
let pythonRunButton = null
let pyodidePromise = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.ready === "1") resolve()
      else existing.addEventListener("load", () => resolve(), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      script.dataset.ready = "1"
      resolve()
    }
    script.onerror = () => reject(new Error(`Could not load ${src}`))
    document.head.append(script)
  })
}

function loadStyle(href) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  document.head.append(link)
}

function pyAppend(text, kind) {
  const line = document.createElement("span")
  if (kind) line.className = kind
  line.textContent = text
  pythonConsole.append(line)
  pythonConsole.scrollTop = pythonConsole.scrollHeight
}

async function ensureEditorLibs() {
  loadStyle(`${CM_BASE}lib/codemirror.css`)
  await loadScript(`${CM_BASE}lib/codemirror.js`)
  await loadScript(`${CM_BASE}mode/python/python.js`)
}

function ensurePyodide() {
  if (!pyodidePromise) {
    pyodidePromise = loadScript(`${PY_INDEX}pyodide.js`).then(() =>
      window.loadPyodide({ indexURL: PY_INDEX })
    )
  }
  return pyodidePromise
}

async function runPython() {
  if (!pythonEditor) return
  const code = pythonEditor.getValue()
  pythonConsole.replaceChildren()
  pythonRunButton.disabled = true
  pyAppend("Running…\n", "py-meta")
  try {
    const pyodide = await ensurePyodide()
    pythonConsole.replaceChildren()
    pyodide.setStdout({
      batched: (text) => pyAppend(text.endsWith("\n") ? text : `${text}\n`, ""),
    })
    pyodide.setStderr({
      batched: (text) => pyAppend(text.endsWith("\n") ? text : `${text}\n`, "py-err"),
    })
    await pyodide.runPythonAsync(code)
  } catch (error) {
    const message = String(error && error.message ? error.message : error)
    pyAppend(message.endsWith("\n") ? message : `${message}\n`, "py-err")
  } finally {
    pythonRunButton.disabled = false
  }
}

function renderPythonLab() {
  if (pythonBuilt) {
    if (pythonEditor) pythonEditor.refresh()
    return
  }
  const root = document.querySelector("#python-root")
  if (!root) return
  pythonBuilt = true

  const lab = document.createElement("div")
  lab.className = "python-lab"

  const toolbar = document.createElement("div")
  toolbar.className = "python-toolbar"
  pythonRunButton = document.createElement("button")
  pythonRunButton.type = "button"
  pythonRunButton.className = "python-run"
  pythonRunButton.textContent = "Run"
  const hint = document.createElement("span")
  hint.className = "python-hint"
  hint.textContent = "Ctrl+Enter"
  toolbar.append(pythonRunButton, hint)

  const editorHost = document.createElement("div")
  editorHost.className = "python-editor"
  const area = document.createElement("textarea")
  area.value = 'print("Hello World")\n'
  editorHost.append(area)

  const label = document.createElement("p")
  label.className = "python-console-label"
  label.textContent = "Console"

  pythonConsole = document.createElement("pre")
  pythonConsole.className = "python-console"
  pythonConsole.setAttribute("aria-live", "polite")

  lab.append(toolbar, editorHost, label, pythonConsole)
  root.append(lab)

  pythonRunButton.addEventListener("click", () => {
    runPython()
  })

  ensureEditorLibs()
    .then(() => {
      pythonEditor = window.CodeMirror.fromTextArea(area, {
        mode: "python",
        theme: "default",
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: {
          "Ctrl-Enter": () => runPython(),
          "Cmd-Enter": () => runPython(),
        },
      })
      pythonEditor.setSize("100%", "100%")
    })
    .catch(() => {
      pyAppend("The code editor could not be loaded.\n", "py-err")
    })
}

window.renderPythonLab = renderPythonLab
