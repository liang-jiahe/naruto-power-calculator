import type {
  AttributeStats,
  CalculationResult,
  CalculatorState,
  CoreStats,
  ElementStats,
} from '../domain/types'

const MODULE_LABELS: Record<string, string> = {
  level: '等级',
  equipment: '装备',
  magatama: '勾玉',
  artifact: '神器',
  scroll: '秘卷',
  outfit: '装扮',
  title: '称号',
  avatar: '头像框',
  talent: '天赋',
  soul: '忍魂',
  summoning: '通灵',
  accessories: '饰品与符文',
  toolPanel: '忍具穿戴',
  toolReforge: '挂件坠饰重铸',
  toolMuseum: '藏馆',
  toolTreasure: '珍品阁',
}

const ELEMENT_LABELS: Record<keyof ElementStats, string> = {
  fire: '火',
  water: '水',
  wind: '风',
  thunder: '雷',
  earth: '土',
}

const RUNE_LABELS: Record<string, string> = {
  earrings: '耳环',
  necklace: '项链',
  bracelet: '手镯',
  ring: '戒指',
  badge: '徽章',
  belt: '腰带',
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

type InputRow = [module: string, field: string, value: string]

function buildInputRows(state: CalculatorState): InputRow[] {
  const rows: InputRow[] = [
    ['基础配置', '当前等级', `${state.level} 级`],
    ['忍者收集', '全收集加成', `${state.bonuses.collectionPct}%`],
    ['忍者收集', '生命百分比', `${state.bonuses.hpPct}%`],
    ['忍者收集', '攻击百分比', `${state.bonuses.atkPct}%`],
    ['忍者收集', '防御百分比', `${state.bonuses.defPct}%`],
  ]

  const addCore = (module: string, stats: CoreStats) => {
    rows.push(
      [module, '生命', formatNumber(stats.hp)],
      [module, '攻击', formatNumber(stats.atk)],
      [module, '防御', formatNumber(stats.def)],
    )
  }
  const addElements = (module: string, suffix: string, stats: ElementStats) => {
    for (const key of Object.keys(ELEMENT_LABELS) as Array<keyof ElementStats>) {
      rows.push([module, `${ELEMENT_LABELS[key]}${suffix}`, formatNumber(stats[key])])
    }
  }
  const addAttributes = (module: string, stats: AttributeStats) => {
    addCore(module, stats)
    rows.push(
      [module, '暴击', formatNumber(stats.crit)],
      [module, '抗暴', formatNumber(stats.antiCrit)],
    )
    addElements(module, '攻', stats.elementAtk)
    addElements(module, '防', stats.elementDef)
  }

  addCore('装备', state.simple.equipment)
  addCore('勾玉', state.simple.magatama)
  addCore('神器', state.simple.artifact)
  addCore('秘卷', state.simple.scroll)
  addCore('装扮', state.simple.outfit)
  addCore('称号', state.simple.title)
  addCore('头像框', state.simple.avatar)
  addCore('天赋 · 普通', state.talent.normal)
  addCore('天赋 · 修罗', state.talent.shura)
  addCore('忍魂 · 忍传感悟', state.soul.insight)
  addCore('忍魂 · 羁绊升级', state.soul.bond)

  rows.push(
    ['通灵', '通灵兽', state.summon.beast],
    ['通灵', '修炼等级', `${state.summon.level} 级`],
    ['通灵', '强化次数', `第 ${state.summon.enhance} 次`],
  )
  addCore('通灵 · 总面板', state.summon.total)

  addAttributes('饰品', state.accessories.stats)
  for (const [slot, rune] of Object.entries(state.accessories.runes)) {
    rows.push(['符文', `${RUNE_LABELS[slot] ?? slot}战力`, formatNumber(rune.power)])
  }

  addAttributes('忍具 · 穿戴', state.tools.panel)
  addAttributes('忍具 · 重铸', state.tools.reforge)
  rows.push(
    ['忍具 · 藏馆', '计算模式', state.tools.museumMode === 'direct' ? '直接战力' : '属性计算'],
    ['忍具 · 藏馆', '直接战力', formatNumber(state.tools.museumDirectPower)],
  )
  addAttributes('忍具 · 藏馆属性', state.tools.museumStats)
  rows.push(
    ['忍具 · 珍品阁', '计算模式', state.tools.treasureMode === 'direct' ? '直接战力' : '属性计算'],
    ['忍具 · 珍品阁', '直接战力', formatNumber(state.tools.treasureDirectPower)],
  )
  addElements('忍具 · 珍品阁', '防', state.tools.treasureElementDef)

  return rows
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

async function loadPdfFont() {
  const response = await fetch(`${import.meta.env.BASE_URL}fonts/NotoSansSC-Regular.ttf`)
  if (!response.ok) throw new Error('中文字体加载失败，请刷新页面后重试')
  return new Uint8Array(await response.arrayBuffer())
}

export async function createPowerReportPdf(
  state: CalculatorState,
  result: CalculationResult,
  suppliedFont?: Uint8Array,
): Promise<Blob> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const fontBytes = suppliedFont ?? (await loadPdfFont())
  const document = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true,
  })

  document.addFileToVFS('NotoSansSC-Regular.ttf', bytesToBase64(fontBytes))
  document.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal')
  document.setFont('NotoSansSC', 'normal')

  const pageWidth = document.internal.pageSize.getWidth()
  const pageHeight = document.internal.pageSize.getHeight()
  const marginX = 14
  const contentWidth = pageWidth - marginX * 2
  const primary = [56, 103, 84] as [number, number, number]
  const deep = [33, 76, 59] as [number, number, number]
  const muted = [102, 115, 107] as [number, number, number]
  const headerFill = [216, 239, 227] as [number, number, number]
  const paleYellow = [255, 249, 216] as [number, number, number]
  let cursorY = 16

  const ensureSpace = (height = 18) => {
    if (cursorY + height <= pageHeight - 18) return
    document.addPage()
    cursorY = 18
  }

  const addSectionTitle = (text: string) => {
    ensureSpace(16)
    document.setTextColor(...deep)
    document.setFontSize(14)
    document.text(text, marginX, cursorY)
    document.setDrawColor(...primary)
    document.setLineWidth(0.7)
    document.line(marginX, cursorY + 2.5, marginX + contentWidth, cursorY + 2.5)
    cursorY += 9
  }

  const addParagraph = (text: string, color = muted) => {
    ensureSpace(15)
    document.setTextColor(...color)
    document.setFontSize(9.5)
    const lines = document.splitTextToSize(text, contentWidth)
    document.text(lines, marginX, cursorY)
    cursorY += lines.length * 5 + 3
  }

  const addTable = (
    head: string[],
    body: Array<Array<string | number>>,
    columnWidths?: number[],
  ) => {
    autoTable(document, {
      startY: cursorY,
      head: [head],
      body,
      theme: 'grid',
      showHead: 'everyPage',
      margin: { left: marginX, right: marginX, top: 18, bottom: 17 },
      styles: {
        font: 'NotoSansSC',
        fontStyle: 'normal',
        fontSize: 8.5,
        textColor: [39, 48, 43],
        lineColor: [220, 227, 221],
        lineWidth: 0.18,
        cellPadding: 2.5,
        valign: 'middle',
        overflow: 'linebreak',
      },
      headStyles: {
        font: 'NotoSansSC',
        fontStyle: 'normal',
        fontSize: 9,
        textColor: deep,
        fillColor: headerFill,
        lineColor: [190, 218, 204],
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: [250, 252, 250] },
      columnStyles: Object.fromEntries(
        (columnWidths ?? []).map((width, index) => [index, { cellWidth: width }]),
      ),
    })
    cursorY =
      ((document as typeof document & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? cursorY) + 9
  }

  document.setTextColor(...primary)
  document.setFontSize(9)
  document.text('NEKO POWER REPORT', marginX, cursorY)
  cursorY += 9
  document.setTextColor(...deep)
  document.setFontSize(23)
  document.text('火影战力计算报告', marginX, cursorY)
  cursorY += 9
  document.setTextColor(...muted)
  document.setFontSize(10.5)
  document.text('当前战力配置、等效面板与分模块结果', marginX, cursorY)
  cursorY += 10

  const generatedAt = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
  addTable(
    ['报告信息', '内容'],
    [
      ['生成时间', generatedAt],
      ['当前等级', `${state.level} 级`],
      ['署名', '繁星の猫猫星'],
      ['数据范围', '战力计算器当前数据；不包含升级时间配置'],
    ],
    [38, contentWidth - 38],
  )

  addSectionTitle('一、战力总览')
  addTable(
    ['指标', '数值'],
    [
      ['综合战力', formatNumber(result.grandTotal)],
      ['未归属面板战力', formatNumber(result.unattributedPower)],
      ['全收集加成', `${state.bonuses.collectionPct}%`],
    ],
    [62, contentWidth - 62],
  )

  addSectionTitle('二、等效总面板')
  addParagraph('这里只统计能够明确拆分为属性的战力；直接输入战力不会反推面板属性。')
  addTable(
    ['属性', '等效数值'],
    [
      ['生命', formatNumber(result.panel.hp)],
      ['攻击', formatNumber(result.panel.atk)],
      ['防御', formatNumber(result.panel.def)],
      ['暴击', formatNumber(result.panel.crit)],
      ['抗暴', formatNumber(result.panel.antiCrit)],
      ['元素攻击', formatNumber(result.panel.elementAtk)],
      ['元素防御', formatNumber(result.panel.elementDef)],
    ],
    [62, contentWidth - 62],
  )

  addSectionTitle('三、分模块战力')
  addTable(
    ['模块', '当前战力', '其中直接战力'],
    Object.entries(result.sections).map(([key, value]) => [
      MODULE_LABELS[key] ?? key,
      formatNumber(value.total),
      formatNumber(value.direct),
    ]),
    [70, 62, contentWidth - 132],
  )

  addSectionTitle('四、当前录入数据')
  addParagraph('以下为生成报告时各板块的文本化输入明细，空白输入按 0 展示。')
  addTable(
    ['板块', '字段', '录入值'],
    buildInputRows(state),
    [54, 60, contentWidth - 114],
  )

  addSectionTitle('五、计算系数说明')
  addParagraph(
    '生命按 1 计算；攻击按 3.5 计算；防御按 11.6 计算；暴击与元素攻击按 6 计算；抗暴与元素防御按 10 计算。',
    [39, 48, 43],
  )
  addParagraph(
    '收集倍率 = 1 + 全收集加成÷100 ×（1 + 对应属性百分比÷100）。',
    [39, 48, 43],
  )
  addParagraph(
    '不同模块是否享受收集加成，以网页各板块显示的计算公式为准。',
    [39, 48, 43],
  )

  ensureSpace(24)
  document.setFillColor(...paleYellow)
  document.roundedRect(marginX, cursorY, contentWidth, 18, 2, 2, 'F')
  document.setTextColor(74, 69, 67)
  document.setFontSize(8.5)
  const disclaimer = document.splitTextToSize(
    '声明：本报告由非官方同人工具在浏览器本地生成，仅供数据分析与交流，不代表游戏官方规则或数值承诺。',
    contentWidth - 10,
  )
  document.text(disclaimer, marginX + 5, cursorY + 6)

  const totalPages = document.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    document.setPage(page)
    document.setDrawColor(220, 227, 221)
    document.setLineWidth(0.2)
    document.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12)
    document.setTextColor(...muted)
    document.setFontSize(7.5)
    document.text('火影战力计算器 · 繁星の猫猫星', marginX, pageHeight - 7)
    document.text(`第 ${page} / ${totalPages} 页`, pageWidth - marginX, pageHeight - 7, {
      align: 'right',
    })
  }

  return document.output('blob')
}
