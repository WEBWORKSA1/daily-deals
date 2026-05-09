// Bundle the extension files into a downloadable ZIP on the fly

import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const zip = new JSZip()

    // Files in /public/extension/
    const files = ['manifest.json', 'content.js', 'content.css', 'popup.html', 'background.js', 'icon.svg']
    const extensionDir = path.join(process.cwd(), 'public', 'extension')

    for (const file of files) {
      try {
        const content = await readFile(path.join(extensionDir, file))
        zip.file(file, content)
      } catch (e) {
        // skip missing files but continue
      }
    }

    // README inside zip
    zip.file('README.txt', `Daily.Deals Browser Extension v1.0
========================================

INSTALLATION (Chrome / Edge / Brave):
  1. Open chrome://extensions
  2. Toggle on "Developer mode" (top right)
  3. Click "Load unpacked"
  4. Select this folder

INSTALLATION (Firefox):
  1. Open about:debugging#/runtime/this-firefox
  2. Click "Load Temporary Add-on"
  3. Select the manifest.json file in this folder

USAGE:
  When you visit a product page on a supported retailer (Amazon, Walmart,
  Best Buy, Target, Costco, etc.), a banner will appear if Daily.Deals
  has a hotter deal we know about.

  Click the extension icon in your browser toolbar to access Daily.Deals.

PRIVACY:
  We only check the product title from the current page. We do not collect
  browsing history, no analytics, no third-party tracking.

WEBSITE: https://daily.deals
`)

    const blob = await zip.generateAsync({ type: 'nodebuffer' })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="daily-deals-extension.zip"',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
