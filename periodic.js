/* Interactive periodic table and a draggable 3D Bohr model. */

const PT_CATEGORIES = [
  ["alkali", "Alkali metal"],
  ["alkaline", "Alkaline earth metal"],
  ["lanthanide", "Lanthanide"],
  ["actinide", "Actinide"],
  ["transition", "Transition metal"],
  ["post", "Post-transition metal"],
  ["metalloid", "Metalloid"],
  ["nonmetal", "Reactive nonmetal"],
  ["halogen", "Halogen"],
  ["noble", "Noble gas"],
]

const PT_OLD_GROUP = {
  1: "1A",
  2: "2A",
  3: "3B",
  4: "4B",
  5: "5B",
  6: "6B",
  7: "7B",
  8: "8B",
  9: "8B",
  10: "8B",
  11: "1B",
  12: "2B",
  13: "3A",
  14: "4A",
  15: "5A",
  16: "6A",
  17: "7A",
  18: "8A",
}

// symbol, name, mass, category, group (null for the f-block rows)
const PT_ELEMENTS = [
  ["H", "Hydrogen", "1.008", "nonmetal", 1, "The lightest element. It is a colorless gas and the main ingredient in water and in most stars."],
  ["He", "Helium", "4.003", "noble", 18, "A very light noble gas. It stays alone as single atoms and is used to fill balloons."],
  ["Li", "Lithium", "6.94", "alkali", 1, "The lightest metal. It is soft, reacts with water, and is used in rechargeable batteries."],
  ["Be", "Beryllium", "9.012", "alkaline", 2, "A hard, light alkaline earth metal used in special alloys and in X-ray windows."],
  ["B", "Boron", "10.81", "metalloid", 13, "A metalloid used in borax, glass, and some plant nutrients."],
  ["C", "Carbon", "12.011", "nonmetal", 14, "The backbone of living molecules. Diamond and graphite are both forms of carbon."],
  ["N", "Nitrogen", "14.007", "nonmetal", 15, "A colorless gas that makes up most of Earth's air and is built into proteins."],
  ["O", "Oxygen", "15.999", "nonmetal", 16, "A colorless gas that humans breathe and that reacts with many other elements."],
  ["F", "Fluorine", "18.998", "halogen", 17, "The most reactive halogen. Its compounds include fluoride in toothpaste."],
  ["Ne", "Neon", "20.180", "noble", 18, "A noble gas that glows reddish orange in the tubes of neon signs."],
  ["Na", "Sodium", "22.990", "alkali", 1, "A soft metal that reacts quickly with water. Table salt contains sodium."],
  ["Mg", "Magnesium", "24.305", "alkaline", 2, "A light metal that burns with a bright white flame and is found in chlorophyll."],
  ["Al", "Aluminum", "26.982", "post", 13, "A light, common metal used in cans, foil, and airplane parts."],
  ["Si", "Silicon", "28.085", "metalloid", 14, "A metalloid that is the main material in computer chips and in sand as silica."],
  ["P", "Phosphorus", "30.974", "nonmetal", 15, "A reactive nonmetal used in DNA, fertilizers, and match heads."],
  ["S", "Sulfur", "32.06", "nonmetal", 16, "A yellow solid known for its smell in some compounds and its use in sulfuric acid."],
  ["Cl", "Chlorine", "35.45", "halogen", 17, "A greenish gas used to disinfect water. It is part of table salt."],
  ["Ar", "Argon", "39.95", "noble", 18, "A noble gas that fills some light bulbs and makes up about one percent of air."],
  ["K", "Potassium", "39.098", "alkali", 1, "A soft metal that plants need. Bananas and many salts contain potassium."],
  ["Ca", "Calcium", "40.078", "alkaline", 2, "An alkaline earth metal that strengthens bones and teeth and is common in limestone."],
  ["Sc", "Scandium", "44.956", "transition", 3, "A light, silvery transition metal used in a few special alloys."],
  ["Ti", "Titanium", "47.867", "transition", 4, "A strong, light metal used in aircraft, implants, and white paint."],
  ["V", "Vanadium", "50.942", "transition", 5, "A hard metal added to steel to make it tougher."],
  ["Cr", "Chromium", "51.996", "transition", 6, "A shiny metal that gives stainless steel its resistance to rust."],
  ["Mn", "Manganese", "54.938", "transition", 7, "A metal added to steel and also needed in small amounts by the body."],
  ["Fe", "Iron", "55.845", "transition", 8, "The main metal in steel and in hemoglobin, which carries oxygen in blood."],
  ["Co", "Cobalt", "58.933", "transition", 9, "A metal used in blue pigments and in some batteries and magnets."],
  ["Ni", "Nickel", "58.693", "transition", 10, "A tough, silvery metal used in coins, stainless steel, and batteries."],
  ["Cu", "Copper", "63.546", "transition", 11, "A reddish metal that conducts electricity well and is used in wires."],
  ["Zn", "Zinc", "65.38", "transition", 12, "A metal used to coat steel so it does not rust, and found in some vitamins."],
  ["Ga", "Gallium", "69.723", "post", 13, "A soft metal that can melt in a warm hand. It is used in some electronics."],
  ["Ge", "Germanium", "72.630", "metalloid", 14, "A metalloid used in fiber optics and some electronic parts."],
  ["As", "Arsenic", "74.922", "metalloid", 15, "A metalloid that is poisonous in many compounds and is used in some semiconductors."],
  ["Se", "Selenium", "78.971", "nonmetal", 16, "A nonmetal needed in tiny amounts in the diet and used in some glass and electronics."],
  ["Br", "Bromine", "79.904", "halogen", 17, "A reddish brown liquid halogen. Its compounds are used in flame retardants and film."],
  ["Kr", "Krypton", "83.798", "noble", 18, "A noble gas used in some bright lamps and in certain lasers."],
  ["Rb", "Rubidium", "85.468", "alkali", 1, "A very reactive alkali metal that ignites in air and is used in some research clocks."],
  ["Sr", "Strontium", "87.62", "alkaline", 2, "An alkaline earth metal that burns red and is used in fireworks and flares."],
  ["Y", "Yttrium", "88.906", "transition", 3, "A silvery metal used in LEDs, lasers, and some camera lenses."],
  ["Zr", "Zirconium", "91.224", "transition", 4, "A metal that resists corrosion and is used in nuclear reactors and ceramics."],
  ["Nb", "Niobium", "92.906", "transition", 5, "A metal used in superconducting magnets and in strong steel alloys."],
  ["Mo", "Molybdenum", "95.95", "transition", 6, "A metal that strengthens steel and is also needed by some enzymes."],
  ["Tc", "Technetium", "[98]", "transition", 7, "The lightest element that is radioactive in every form. It is used in medical scans."],
  ["Ru", "Ruthenium", "101.07", "transition", 8, "A rare hard metal used in electrical contacts and as a chemical catalyst."],
  ["Rh", "Rhodium", "102.91", "transition", 9, "A shiny rare metal used in catalytic converters and jewelry plating."],
  ["Pd", "Palladium", "106.42", "transition", 10, "A metal that absorbs hydrogen and is used in catalytic converters."],
  ["Ag", "Silver", "107.87", "transition", 11, "The best everyday conductor of electricity. It is used in jewelry, photos, and electronics."],
  ["Cd", "Cadmium", "112.41", "transition", 12, "A soft toxic metal once common in rechargeable batteries and yellow pigments."],
  ["In", "Indium", "114.82", "post", 13, "A soft metal used in touch screens as indium tin oxide."],
  ["Sn", "Tin", "118.71", "post", 14, "A familiar metal used to coat other metals and to make bronze."],
  ["Sb", "Antimony", "121.76", "metalloid", 15, "A brittle metalloid used in flame retardants and some alloys."],
  ["Te", "Tellurium", "127.60", "metalloid", 16, "A brittle metalloid used in solar cells and in some metal alloys."],
  ["I", "Iodine", "126.90", "halogen", 17, "A purple-gray solid halogen used in medicine and needed by the thyroid."],
  ["Xe", "Xenon", "131.29", "noble", 18, "A heavy noble gas used in camera flashes, spacecraft ion engines, and some anesthesia."],
  ["Cs", "Cesium", "132.91", "alkali", 1, "A soft gold-colored metal that melts near room temperature and is used in atomic clocks."],
  ["Ba", "Barium", "137.33", "alkaline", 2, "An alkaline earth metal whose compounds are used in medical imaging of the stomach."],
  ["La", "Lanthanum", "138.91", "lanthanide", 3, "The first lanthanide. It is used in camera lenses and in some lighter flints."],
  ["Ce", "Cerium", "140.12", "lanthanide", null, "The most common lanthanide. Its oxide is used to polish glass."],
  ["Pr", "Praseodymium", "140.91", "lanthanide", null, "A lanthanide used in magnets, aircraft alloys, and yellow-green glass."],
  ["Nd", "Neodymium", "144.24", "lanthanide", null, "A lanthanide that makes the strong magnets in headphones and hard drives."],
  ["Pm", "Promethium", "[145]", "lanthanide", null, "A radioactive lanthanide that does not occur naturally in useful amounts on Earth."],
  ["Sm", "Samarium", "150.36", "lanthanide", null, "A lanthanide used in magnets and in some cancer treatments."],
  ["Eu", "Europium", "151.96", "lanthanide", null, "A lanthanide that gives red and blue light in older television phosphors."],
  ["Gd", "Gadolinium", "157.25", "lanthanide", null, "A lanthanide used in MRI contrast agents and in some nuclear reactors."],
  ["Tb", "Terbium", "158.93", "lanthanide", null, "A lanthanide used in green phosphors and in devices that change shape in a magnetic field."],
  ["Dy", "Dysprosium", "162.50", "lanthanide", null, "A lanthanide added to magnets so they keep working when they get hot."],
  ["Ho", "Holmium", "164.93", "lanthanide", null, "A lanthanide with strong magnetic properties, used in some lasers."],
  ["Er", "Erbium", "167.26", "lanthanide", null, "A lanthanide used to amplify signals in fiber-optic cables."],
  ["Tm", "Thulium", "168.93", "lanthanide", null, "One of the rarest stable lanthanides. It is used in some portable X-ray devices."],
  ["Yb", "Ytterbium", "173.05", "lanthanide", null, "A soft lanthanide used in some lasers and stainless steels."],
  ["Lu", "Lutetium", "174.97", "lanthanide", null, "The last lanthanide. It is dense and is used in a few medical scanners."],
  ["Hf", "Hafnium", "178.49", "transition", 4, "A metal that absorbs neutrons and is used in nuclear control rods."],
  ["Ta", "Tantalum", "180.95", "transition", 5, "A corrosion-resistant metal used in capacitors for phones and computers."],
  ["W", "Tungsten", "183.84", "transition", 6, "The metal with the highest melting point. It is used in light-bulb filaments and cutting tools."],
  ["Re", "Rhenium", "186.21", "transition", 7, "A rare dense metal used in jet-engine alloys."],
  ["Os", "Osmium", "190.23", "transition", 8, "The densest stable element. It is used in a few hard alloys and pen tips."],
  ["Ir", "Iridium", "192.22", "transition", 9, "A very hard, corrosion-proof metal used in spark plugs and crucibles."],
  ["Pt", "Platinum", "195.08", "transition", 10, "A precious metal used in jewelry, catalytic converters, and laboratory tools."],
  ["Au", "Gold", "196.97", "transition", 11, "A soft yellow metal that does not tarnish. It is used in jewelry and electronics."],
  ["Hg", "Mercury", "200.59", "transition", 12, "The only metal that is liquid at room temperature. It is toxic and was used in thermometers."],
  ["Tl", "Thallium", "204.38", "post", 13, "A soft, toxic metal once used in rat poison and now in a few electronics."],
  ["Pb", "Lead", "207.2", "post", 14, "A heavy, soft metal once common in pipes and paint. It is still used in car batteries."],
  ["Bi", "Bismuth", "208.98", "post", 15, "A brittle metal with a pink shine, used in some medicines and low-melting alloys."],
  ["Po", "Polonium", "[209]", "metalloid", 16, "A rare radioactive metalloid discovered by Marie and Pierre Curie."],
  ["At", "Astatine", "[210]", "halogen", 17, "A rare radioactive halogen. Only tiny amounts exist naturally at any moment."],
  ["Rn", "Radon", "[222]", "noble", 18, "A radioactive noble gas that can collect in basements from uranium in the ground."],
  ["Fr", "Francium", "[223]", "alkali", 1, "An extremely rare radioactive alkali metal. It decays within minutes."],
  ["Ra", "Radium", "[226]", "alkaline", 2, "A radioactive alkaline earth metal once used in glow-in-the-dark paint."],
  ["Ac", "Actinium", "[227]", "actinide", 3, "The first actinide. It is radioactive and glows faintly from its own radiation."],
  ["Th", "Thorium", "232.04", "actinide", null, "A radioactive actinide that can be used as a nuclear fuel."],
  ["Pa", "Protactinium", "231.04", "actinide", null, "A rare radioactive actinide that forms as uranium decays."],
  ["U", "Uranium", "238.03", "actinide", null, "A radioactive actinide used as fuel in nuclear power plants."],
  ["Np", "Neptunium", "[237]", "actinide", null, "The first element made in a lab that is heavier than uranium."],
  ["Pu", "Plutonium", "[244]", "actinide", null, "A radioactive actinide used in some nuclear reactors and weapons."],
  ["Am", "Americium", "[243]", "actinide", null, "A radioactive actinide used in household smoke detectors."],
  ["Cm", "Curium", "[247]", "actinide", null, "A radioactive actinide named for Marie and Pierre Curie."],
  ["Bk", "Berkelium", "[247]", "actinide", null, "A synthetic radioactive actinide first made at the University of California, Berkeley."],
  ["Cf", "Californium", "[251]", "actinide", null, "A synthetic actinide that is a strong source of neutrons."],
  ["Es", "Einsteinium", "[252]", "actinide", null, "A synthetic actinide named for Albert Einstein. It is made in tiny amounts."],
  ["Fm", "Fermium", "[257]", "actinide", null, "A synthetic actinide named for Enrico Fermi."],
  ["Md", "Mendelevium", "[258]", "actinide", null, "A synthetic actinide named for Dmitri Mendeleev, who organized the periodic table."],
  ["No", "Nobelium", "[259]", "actinide", null, "A synthetic actinide named for Alfred Nobel."],
  ["Lr", "Lawrencium", "[266]", "actinide", null, "The last actinide, named for Ernest Lawrence. Only a few atoms are made at a time."],
  ["Rf", "Rutherfordium", "[267]", "transition", 4, "A synthetic metal named for Ernest Rutherford. Its atoms decay in seconds or less."],
  ["Db", "Dubnium", "[268]", "transition", 5, "A synthetic metal named for the city of Dubna, where it was studied."],
  ["Sg", "Seaborgium", "[269]", "transition", 6, "A synthetic metal named for Glenn Seaborg, who helped map the actinides."],
  ["Bh", "Bohrium", "[270]", "transition", 7, "A synthetic metal named for Niels Bohr, whose model of the atom this page draws."],
  ["Hs", "Hassium", "[277]", "transition", 8, "A synthetic metal named for the German state of Hesse."],
  ["Mt", "Meitnerium", "[278]", "transition", 9, "A synthetic metal named for physicist Lise Meitner."],
  ["Ds", "Darmstadtium", "[281]", "transition", 10, "A synthetic metal named for Darmstadt, Germany, where it was discovered."],
  ["Rg", "Roentgenium", "[282]", "transition", 11, "A synthetic metal named for Wilhelm Röntgen, who discovered X-rays."],
  ["Cn", "Copernicium", "[285]", "transition", 12, "A synthetic metal named for Nicolaus Copernicus. It may behave a bit like a gas."],
  ["Nh", "Nihonium", "[286]", "post", 13, "A synthetic element named for Japan. Only a handful of atoms have been made."],
  ["Fl", "Flerovium", "[289]", "post", 14, "A synthetic element named for the Flerov laboratory in Russia."],
  ["Mc", "Moscovium", "[290]", "post", 15, "A synthetic element named for the Moscow region."],
  ["Lv", "Livermorium", "[293]", "post", 16, "A synthetic element named for Lawrence Livermore National Laboratory."],
  ["Ts", "Tennessine", "[294]", "halogen", 17, "A synthetic halogen named for Tennessee. Its chemistry is still mostly predicted."],
  ["Og", "Oganesson", "[294]", "noble", 18, "A synthetic noble gas named for Yuri Oganessian. It is the heaviest known element."],
]

const PT_ORBITALS = [
  [1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6],
  [5, 2], [4, 10], [5, 6], [6, 2], [4, 14], [5, 10], [6, 6],
  [7, 2], [5, 14], [6, 10], [7, 6],
]

const PT_STATES = {
  gas: new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86, 118]),
  liquid: new Set([35, 80]),
}

let ptBuilt = false
let ptDialog = null
let ptCanvas = null
let ptAnim = 0
let ptRotX = 0.45
let ptRotY = 0.4
let ptSpin = 0
let ptDragging = false
let ptShells = []
let ptSymbol = ""

function ptElement(z) {
  const row = PT_ELEMENTS[z - 1]
  return {
    z,
    symbol: row[0],
    name: row[1],
    mass: row[2],
    category: row[3],
    group: row[4],
    blurb: row[5],
    period: z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : z <= 36 ? 4 : z <= 54 ? 5 : z <= 86 ? 6 : 7,
  }
}

function electronShells(z) {
  let left = z
  const byN = {}
  PT_ORBITALS.forEach(([n, cap]) => {
    if (left <= 0) return
    const take = Math.min(cap, left)
    byN[n] = (byN[n] || 0) + take
    left -= take
  })
  const maxN = Math.max(...Object.keys(byN).map(Number))
  return Array.from({ length: maxN }, (_, index) => byN[index + 1] || 0)
}

function ptState(z) {
  if (PT_STATES.gas.has(z)) return "Gas"
  if (PT_STATES.liquid.has(z)) return "Liquid"
  if (z >= 104) return "Synthetic"
  return "Solid"
}

function ptCategoryName(key) {
  const match = PT_CATEGORIES.find(([id]) => id === key)
  return match ? match[1] : key
}

function ptCell(element) {
  const button = document.createElement("button")
  button.type = "button"
  button.className = `pt-cell pt-cat-${element.category}`
  button.dataset.cat = element.category
  button.setAttribute("aria-label", `${element.name}, atomic number ${element.z}`)
  const number = document.createElement("span")
  number.className = "pt-z"
  number.textContent = String(element.z)
  const symbol = document.createElement("span")
  symbol.className = "pt-sym"
  symbol.textContent = element.symbol
  const name = document.createElement("span")
  name.className = "pt-name"
  name.textContent = element.name
  button.append(number, symbol, name)
  button.addEventListener("click", () => ptOpen(element.z))
  return button
}

function ptMarker(text, category) {
  const marker = document.createElement("div")
  marker.className = `pt-marker pt-cat-${category}`
  marker.dataset.cat = category
  marker.textContent = text
  return marker
}

function ptEmpty() {
  return document.createElement("div")
}

function ptPlace(row, element) {
  row.append(ptCell(element))
}

function ptBuildBoard(root) {
  const scroll = document.createElement("div")
  scroll.className = "pt-scroll"
  const board = document.createElement("div")
  board.className = "pt-board"

  const groups = document.createElement("div")
  groups.className = "pt-groups"
  groups.append(ptEmpty())
  for (let group = 1; group <= 18; group += 1) {
    const label = document.createElement("div")
    label.className = "pt-group"
    const number = document.createElement("span")
    number.className = "pt-gnum"
    number.textContent = String(group)
    const oldName = document.createElement("span")
    oldName.className = "pt-gold"
    oldName.textContent = PT_OLD_GROUP[group]
    label.append(number, oldName)
    groups.append(label)
  }
  board.append(groups)

  function addMainRow(period, zs) {
    const row = document.createElement("div")
    row.className = "pt-row"
    const label = document.createElement("div")
    label.className = "pt-period"
    label.textContent = String(period)
    row.append(label)
    zs.forEach((entry) => {
      if (entry == null) row.append(ptEmpty())
      else if (typeof entry === "string") {
        const category = entry.startsWith("57") ? "lanthanide" : "actinide"
        row.append(ptMarker(entry, category))
      } else ptPlace(row, ptElement(entry))
    })
    board.append(row)
  }

  addMainRow(1, [1, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 2])
  addMainRow(2, [3, 4, null, null, null, null, null, null, null, null, null, null, 5, 6, 7, 8, 9, 10])
  addMainRow(3, [11, 12, null, null, null, null, null, null, null, null, null, null, 13, 14, 15, 16, 17, 18])
  addMainRow(4, [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36])
  addMainRow(5, [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54])
  addMainRow(6, [55, 56, "57–71", 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86])
  addMainRow(7, [87, 88, "89–103", 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118])

  function addSeries(title, start) {
    const heading = document.createElement("p")
    heading.className = "pt-series-label"
    heading.textContent = title
    board.append(heading)
    const row = document.createElement("div")
    row.className = "pt-row"
    row.append(ptEmpty(), ptEmpty(), ptEmpty())
    for (let z = start; z < start + 15; z += 1) ptPlace(row, ptElement(z))
    board.append(row)
  }

  const gap = document.createElement("div")
  gap.className = "pt-gap"
  board.append(gap)
  addSeries("Lanthanides", 57)
  addSeries("Actinides", 89)

  const legend = document.createElement("div")
  legend.className = "pt-legend"
  PT_CATEGORIES.forEach(([id, label]) => {
    const item = document.createElement("button")
    item.type = "button"
    const swatch = document.createElement("span")
    swatch.className = `pt-swatch pt-cat-${id}`
    item.append(swatch, document.createTextNode(label))
    item.addEventListener("mouseenter", () => ptDim(board, id))
    item.addEventListener("focus", () => ptDim(board, id))
    item.addEventListener("mouseleave", () => ptDim(board, null))
    item.addEventListener("blur", () => ptDim(board, null))
    legend.append(item)
  })

  scroll.append(board)
  root.append(scroll, legend)
  ptBuildDialog(root)
}

function ptDim(board, category) {
  board.querySelectorAll("[data-cat]").forEach((cell) => {
    cell.classList.toggle("is-dim", Boolean(category) && cell.dataset.cat !== category)
  })
}

function ptBuildDialog(root) {
  ptDialog = document.createElement("dialog")
  ptDialog.className = "pt-dialog"
  const card = document.createElement("div")
  card.className = "pt-card"
  const wrap = document.createElement("div")
  wrap.className = "pt-bohr-wrap"
  ptCanvas = document.createElement("canvas")
  ptCanvas.className = "pt-bohr"
  ptCanvas.width = 640
  ptCanvas.height = 560
  const note = document.createElement("p")
  note.className = "pt-drag-note"
  note.textContent = "Drag the Bohr model to turn it."
  wrap.append(ptCanvas, note)
  const close = document.createElement("button")
  close.type = "button"
  close.className = "pt-close"
  close.textContent = "Close"
  close.addEventListener("click", () => ptDialog.close())
  const symbol = document.createElement("p")
  symbol.className = "pt-symbol-line"
  symbol.id = "pt-symbol"
  const full = document.createElement("p")
  full.className = "pt-fullname"
  full.id = "pt-full"
  const facts = document.createElement("dl")
  facts.className = "pt-facts"
  facts.id = "pt-facts"
  const blurb = document.createElement("p")
  blurb.className = "pt-blurb"
  blurb.id = "pt-blurb"
  card.append(wrap, close, symbol, full, facts, blurb)
  ptDialog.append(card)
  ptDialog.addEventListener("click", (event) => {
    if (event.target === ptDialog) ptDialog.close()
  })
  ptDialog.addEventListener("close", () => {
    cancelAnimationFrame(ptAnim)
  })
  root.append(ptDialog)
  ptBindDrag()
}

function ptBindDrag() {
  let lastX = 0
  let lastY = 0
  ptCanvas.addEventListener("pointerdown", (event) => {
    ptDragging = true
    lastX = event.clientX
    lastY = event.clientY
    ptCanvas.setPointerCapture(event.pointerId)
  })
  ptCanvas.addEventListener("pointermove", (event) => {
    if (!ptDragging) return
    ptRotY += (event.clientX - lastX) * 0.01
    ptRotX += (event.clientY - lastY) * 0.01
    lastX = event.clientX
    lastY = event.clientY
  })
  const stop = () => {
    ptDragging = false
  }
  ptCanvas.addEventListener("pointerup", stop)
  ptCanvas.addEventListener("pointercancel", stop)
}

function ptFact(facts, label, value) {
  const term = document.createElement("dt")
  term.textContent = label
  const detail = document.createElement("dd")
  detail.textContent = value
  facts.append(term, detail)
}

function ptOpen(z) {
  const element = ptElement(z)
  ptShells = electronShells(element.z)
  ptSymbol = element.symbol
  ptRotX = 0.5
  ptRotY = 0.35
  ptSpin = 0
  document.querySelector("#pt-symbol").textContent = element.symbol
  document.querySelector("#pt-full").textContent = element.name
  const facts = document.querySelector("#pt-facts")
  facts.replaceChildren()
  const groupText = element.group
    ? `${element.group} (${PT_OLD_GROUP[element.group]})`
    : "f-block"
  ptFact(facts, "Atomic number", String(element.z))
  ptFact(facts, "Atomic mass", element.mass)
  ptFact(facts, "Category", ptCategoryName(element.category))
  ptFact(facts, "Period", String(element.period))
  ptFact(facts, "Group", groupText)
  ptFact(facts, "State", ptState(element.z))
  ptFact(facts, "Electrons per shell", ptShells.join(", "))
  document.querySelector("#pt-blurb").textContent = element.blurb
  if (!ptDialog.open) ptDialog.showModal()
  cancelAnimationFrame(ptAnim)
  const frame = (time) => {
    if (!ptDragging) ptSpin = time * 0.00035
    ptDraw(ptRotY + ptSpin)
    ptAnim = requestAnimationFrame(frame)
  }
  ptAnim = requestAnimationFrame(frame)
}

function ptProject(x, y, z, rotX, rotY) {
  const cosY = Math.cos(rotY)
  const sinY = Math.sin(rotY)
  const x1 = x * cosY + z * sinY
  const z1 = z * cosY - x * sinY
  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)
  const y1 = y * cosX - z1 * sinX
  const z2 = y * sinX + z1 * cosX
  const perspective = 4.2 / (4.2 + z2)
  return { x: x1 * perspective, y: y1 * perspective, z: z2, s: perspective }
}

function ptDraw(rotY) {
  const canvas = ptCanvas
  const ctx = canvas.getContext("2d")
  const width = canvas.width
  const height = canvas.height
  ctx.clearRect(0, 0, width, height)
  const cx = width / 2
  const cy = height / 2 + 8
  const shells = ptShells
  const scale = Math.min(width, height) * 0.34

  const rings = shells.map((count, index) => {
    const radius = 0.55 + index * 0.62
    const tilt = index * 0.7
    const points = []
    for (let stepIndex = 0; stepIndex <= 72; stepIndex += 1) {
      const angle = (stepIndex / 72) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y0 = Math.sin(angle) * radius
      const y = y0 * Math.cos(tilt)
      const z = y0 * Math.sin(tilt)
      points.push(ptProject(x, y, z, ptRotX, rotY))
    }
    const electrons = []
    for (let electron = 0; electron < count; electron += 1) {
      const angle = (electron / count) * Math.PI * 2 + index
      const x = Math.cos(angle) * radius
      const y0 = Math.sin(angle) * radius
      const y = y0 * Math.cos(tilt)
      const z = y0 * Math.sin(tilt)
      electrons.push(ptProject(x, y, z, ptRotX, rotY))
    }
    return { points, electrons }
  })

  rings.forEach((ring) => {
    ctx.beginPath()
    ring.points.forEach((point, index) => {
      const x = cx + point.x * scale
      const y = cy + point.y * scale
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = "rgba(49, 64, 44, 0.45)"
    ctx.lineWidth = 1.5
    ctx.stroke()
  })

  const dots = [{ kind: "nucleus", z: 0, s: 1 }]
  rings.forEach((ring) => {
    ring.electrons.forEach((point) => dots.push({ kind: "electron", ...point }))
  })
  dots.sort((left, right) => left.z - right.z)
  dots.forEach((dot) => {
    if (dot.kind === "nucleus") {
      const gradient = ctx.createRadialGradient(cx - 6, cy - 8, 4, cx, cy, 22)
      gradient.addColorStop(0, "#f4f0c8")
      gradient.addColorStop(1, "#c7522a")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(cx, cy, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#2b2412"
      ctx.font = "700 16px Segoe UI, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(ptSymbol, cx, cy + 1)
      return
    }
    const radius = 7 * dot.s
    ctx.fillStyle = "#31402c"
    ctx.beginPath()
    ctx.arc(cx + dot.x * scale, cy + dot.y * scale, Math.max(3.5, radius), 0, Math.PI * 2)
    ctx.fill()
  })
}

function renderPeriodicTable() {
  if (ptBuilt) return
  const root = document.querySelector("#periodic-root")
  if (!root) return
  ptBuilt = true
  ptBuildBoard(root)
}

function closePeriodicDialog() {
  if (ptDialog && ptDialog.open) ptDialog.close()
}

window.renderPeriodicTable = renderPeriodicTable
window.closePeriodicDialog = closePeriodicDialog
