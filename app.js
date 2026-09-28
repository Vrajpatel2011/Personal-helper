const EXPECTED_HASH = "5f4dcc3b5aa765d61d8327deb882cf99"
const SESSION_KEY = "personal-helper-open"

const SHIFT = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21]

function md5(message) {
  const bytes = new TextEncoder().encode(message)
  const total = paddedLength(bytes.length)
  const data = new Uint8Array(total)
  data.set(bytes)
  data[bytes.length] = 0x80

  const view = new DataView(data.buffer)
  const bits = bytes.length * 8
  view.setUint32(total - 8, bits >>> 0, true)
  view.setUint32(total - 4, Math.floor(bits / 0x100000000), true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  for (let offset = 0; offset < total; offset += 64) {
    const words = new Uint32Array(16)
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, true)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let index = 0; index < 64; index += 1) {
      let mixed = 0
      let wordIndex = 0

      if (index < 16) {
        mixed = (b & c) | (~b & d)
        wordIndex = index
      } else if (index < 32) {
        mixed = (d & b) | (~d & c)
        wordIndex = (5 * index + 1) % 16
      } else if (index < 48) {
        mixed = b ^ c ^ d
        wordIndex = (3 * index + 5) % 16
      } else {
        mixed = c ^ (b | ~d)
        wordIndex = (7 * index) % 16
      }

      const sum = add32(add32(add32(a, mixed), sineConstant(index)), words[wordIndex])
      const shift = SHIFT[(index >> 4) * 4 + (index % 4)]
      const rotated = ((sum << shift) | (sum >>> (32 - shift))) >>> 0

      a = d
      d = c
      c = b
      b = add32(b, rotated)
    }

    a0 = add32(a0, a)
    b0 = add32(b0, b)
    c0 = add32(c0, c)
    d0 = add32(d0, d)
  }

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0)
}

function paddedLength(byteLength) {
  const withMarker = byteLength + 1
  const remainder = withMarker % 64
  const zeroPad = remainder <= 56 ? 56 - remainder : 120 - remainder
  return withMarker + zeroPad + 8
}

function sineConstant(index) {
  return Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0
}

function add32(left, right) {
  return (left + right) >>> 0
}

function toHex(word) {
  const bytes = [word & 255, (word >>> 8) & 255, (word >>> 16) & 255, (word >>> 24) & 255]
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function initLogin() {
  if (typeof document === "undefined") return

  const login = document.querySelector("#login")
  const site = document.querySelector("#site")
  const form = document.querySelector("#login-form")
  const input = document.querySelector("#password")
  const error = document.querySelector("#login-error")
  const date = document.querySelector("#today")
  const signOut = document.querySelector("#sign-out")

  date.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())

  function showSite() {
    login.hidden = true
    site.hidden = false
    document.title = "Personal Helper"
  }

  function showLogin() {
    site.hidden = true
    login.hidden = false
    error.hidden = true
    input.value = ""
    document.title = "Sign in · Personal Helper"
    input.focus()
  }

  if (sessionStorage.getItem(SESSION_KEY) === "1") showSite()

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const hashed = md5(input.value)
    if (hashed === EXPECTED_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1")
      showSite()
      return
    }
    error.hidden = false
    input.focus()
  })

  signOut.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY)
    showLogin()
  })
}

initLogin()

if (typeof module !== "undefined" && module.exports) {
  module.exports = { md5 }
}
