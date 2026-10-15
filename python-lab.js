/* Dark Python editor with PyCharm-style colors and a console. */

const PY_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/"
const CM_BASE = "https://cdn.jsdelivr.net/npm/codemirror@5.65.18/"

const PY_STORE = "personal-helper-python-projects"

let pythonBuilt = false
let pythonEditor = null
let pythonConsole = null
let pythonRunButton = null
let pythonTabs = null
let pyodidePromise = null
let pythonProjects = []
let pythonActiveId = ""

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

function loadPythonProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(PY_STORE))
    if (saved && Array.isArray(saved.projects) && saved.projects.length) {
      pythonProjects = saved.projects
      pythonActiveId = saved.active && pythonProjects.some((project) => project.id === saved.active)
        ? saved.active
        : pythonProjects[0].id
      return
    }
  } catch {
    // Keep the starter project if stored data is unreadable.
  }
  pythonProjects = [{ id: "main", name: "main.py", code: 'print("Hello World")\n' }]
  pythonActiveId = "main"
}

function activePythonProject() {
  return pythonProjects.find((project) => project.id === pythonActiveId) || pythonProjects[0]
}

function persistPythonProjects() {
  localStorage.setItem(
    PY_STORE,
    JSON.stringify({ active: pythonActiveId, projects: pythonProjects })
  )
}

function rememberEditorCode() {
  if (!pythonEditor) return
  const project = activePythonProject()
  if (project) project.code = pythonEditor.getValue()
  persistPythonProjects()
}

function renderProjectTabs() {
  pythonTabs.replaceChildren()
  pythonProjects.forEach((project) => {
    const tab = document.createElement("div")
    tab.className = "python-tab" + (project.id === pythonActiveId ? " is-active" : "")
    tab.setAttribute("role", "tab")
    tab.setAttribute("aria-selected", project.id === pythonActiveId ? "true" : "false")
    const name = document.createElement("button")
    name.type = "button"
    name.className = "python-tab-name"
    name.textContent = project.name
    name.addEventListener("click", () => openPythonProject(project.id))
    name.addEventListener("dblclick", () => renamePythonProject(project.id, name))
    tab.append(name)
    if (pythonProjects.length > 1) {
      const close = document.createElement("button")
      close.type = "button"
      close.className = "python-tab-close"
      close.textContent = "×"
      close.setAttribute("aria-label", `Close ${project.name}`)
      close.addEventListener("click", () => closePythonProject(project.id))
      tab.append(close)
    }
    pythonTabs.append(tab)
  })
}

function openPythonProject(id) {
  if (id === pythonActiveId) return
  rememberEditorCode()
  pythonActiveId = id
  const project = activePythonProject()
  if (pythonEditor && project) pythonEditor.setValue(project.code)
  if (pythonConsole) pythonConsole.replaceChildren()
  persistPythonProjects()
  renderProjectTabs()
}

function addPythonProject() {
  rememberEditorCode()
  const id = `p${Date.now()}`
  pythonProjects.push({ id, name: `project ${pythonProjects.length + 1}.py`, code: "" })
  pythonActiveId = id
  if (pythonEditor) pythonEditor.setValue("")
  if (pythonConsole) pythonConsole.replaceChildren()
  persistPythonProjects()
  renderProjectTabs()
  if (pythonEditor) pythonEditor.focus()
}

function closePythonProject(id) {
  if (pythonProjects.length < 2) return
  rememberEditorCode()
  const index = pythonProjects.findIndex((project) => project.id === id)
  if (index < 0) return
  pythonProjects.splice(index, 1)
  if (pythonActiveId === id) {
    const next = pythonProjects[Math.max(0, index - 1)]
    pythonActiveId = next.id
    if (pythonEditor) pythonEditor.setValue(next.code)
    if (pythonConsole) pythonConsole.replaceChildren()
  }
  persistPythonProjects()
  renderProjectTabs()
}

function renamePythonProject(id, label) {
  const project = pythonProjects.find((item) => item.id === id)
  if (!project) return
  const input = document.createElement("input")
  input.className = "python-tab-rename"
  input.value = project.name
  label.replaceWith(input)
  input.focus()
  input.select()
  const finish = () => {
    const next = input.value.trim()
    if (next) project.name = next.endsWith(".py") ? next : `${next}.py`
    persistPythonProjects()
    renderProjectTabs()
  }
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") input.blur()
    if (event.key === "Escape") {
      input.value = project.name
      input.blur()
    }
  })
  input.addEventListener("blur", finish, { once: true })
}

async function runPython() {
  if (!pythonEditor) return
  rememberEditorCode()
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

  loadPythonProjects()
  const starting = activePythonProject()

  const toolbar = document.createElement("div")
  toolbar.className = "python-toolbar"
  pythonRunButton = document.createElement("button")
  pythonRunButton.type = "button"
  pythonRunButton.className = "python-run"
  pythonRunButton.textContent = "Run"
  pythonTabs = document.createElement("div")
  pythonTabs.className = "python-tabs"
  pythonTabs.setAttribute("role", "tablist")
  pythonTabs.setAttribute("aria-label", "Projects")
  const add = document.createElement("button")
  add.type = "button"
  add.className = "python-new"
  add.textContent = "+"
  add.setAttribute("aria-label", "New project")
  add.addEventListener("click", addPythonProject)
  toolbar.append(pythonRunButton, pythonTabs, add)
  renderProjectTabs()

  const editorHost = document.createElement("div")
  editorHost.className = "python-editor"
  const area = document.createElement("textarea")
  area.value = starting ? starting.code : 'print("Hello World")\n'
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
      pythonEditor.on("change", rememberEditorCode)
    })
    .catch(() => {
      pyAppend("The code editor could not be loaded.\n", "py-err")
    })
}

window.renderPythonLab = renderPythonLab
