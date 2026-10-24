// Bond Certificate Generator — E shopy
// Opens a print-ready A4 certificate in a new browser tab

export interface BondData {
  memberNumber: string;
  memberName: string;
  dob?: string;
  fatherName?: string;
  address?: string;
  accountNo: string;
  commencementDate: string;
  planTerm?: string;
  planAmount: number;
  interestRate?: number;
  aadhaarNo?: string;
  panNo?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  maturityAmount?: number;
  maturityDate?: string;
  branchCode?: string;
  branch?: string;
  profilePhotoUrl?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const toWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + toWords(n % 100) : '');
    if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
    return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let words = toWords(rupees) + ' Rupees';
  if (paise > 0) words += ' and ' + toWords(paise) + ' Paise';
  return words + ' Only';
};

const addDays = (ds: string, d: number): string => {
  if (!ds) return '';
  const dt = new Date(ds);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
};

const fmt = (ds: string): string => {
  try { return new Date(ds).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return ds || ''; }
};

/** Fetch any URL and return a base64 data-URI string */
const toBase64DataUrl = (url: string): Promise<string> =>
  fetch(url)
    .then(r => r.blob())
    .then(blob => new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    }));

// ─── Stamp SVG ───────────────────────────────────────────────────────────────

const buildStamp = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="130" height="130">
  <defs>
    <path id="ts" d="M 25,80 A 55,55 0 0,1 135,80"/>
    <path id="bs" d="M 28,80 A 52,52 0 0,0 132,80"/>
  </defs>
  <circle cx="80" cy="80" r="72" fill="none" stroke="#1a3a7a" stroke-width="2.5"/>
  <circle cx="80" cy="80" r="66" fill="none" stroke="#1a3a7a" stroke-width="1.5"/>
  <circle cx="80" cy="80" r="48" fill="none" stroke="#1a3a7a" stroke-width="1.5"/>
  
  <text font-size="8.5" fill="#1a3a7a" font-family="Arial Black" font-weight="900" letter-spacing="0.5">
    <textPath href="#ts" startOffset="50%" text-anchor="middle">E SHOPY FOUNDATION</textPath>
  </text>
  <text font-size="8.5" fill="#1a3a7a" font-family="Arial Black" font-weight="900" letter-spacing="1">
    <textPath href="#bs" startOffset="50%" text-anchor="middle">HOSPET - 583 201</textPath>
  </text>
  
  <text x="25" y="83" text-anchor="middle" fill="#1a3a7a" font-size="12">★</text>
  <text x="135" y="83" text-anchor="middle" fill="#1a3a7a" font-size="12">★</text>
  
  <text x="80" y="85" text-anchor="middle" fill="#1a3a7a" font-size="20" font-weight="900" font-family="Arial Black">E SHOPY</text>
</svg>`;
};

// ─── HTML Generator ──────────────────────────────────────────────────────────

export const generateBondCertificate = (data: BondData, _logoDataUrl?: string, profilePhotoDataUrl?: string): string => {
  const interestRate = data.interestRate ?? 9.0;
  const maturityDate = data.maturityDate ?? addDays(data.commencementDate, 365);
  const maturityAmt = data.maturityAmount ?? (data.planAmount + (data.planAmount * interestRate / 100));
  const matWords = numberToWords(maturityAmt);
  const commDate = fmt(data.commencementDate);
  const matDate = fmt(maturityDate);
  const stamp = buildStamp();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>FD Bond Certificate — ${data.memberName}</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<style>
/* ── Print setup ── */
@page {
  size: A4 portrait;
  margin: 0;
}
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Roboto', sans-serif;
  background: #f4f4f4;
  display: flex;
  flex-direction: column;
  padding: 2mm 0;
  -webkit-print-color-adjust: exact;
}

/* ── Action bar (hidden on print) ── */
.actions {
  display: flex; justify-content: center; gap: 15px; margin-bottom: 2mm;
}
.btn {
  padding: 8px 24px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold;
}
.btn-p { background: #1a3a7a; color: #fff; }

/* ── A4 Page wrapper ── */
.page {
  width: 210mm;
  height: 297mm;
  background: #fff;
  margin: 0 auto;
  padding: 5mm;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid #ccc;
  overflow: hidden;
}

/* ── Intricate Border (Greek Key pattern style) ── */
.border-frame {
  border: 15px solid transparent;
  padding: 5mm;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M0 0h60v60H0V0zm10 10v40h40V10H10zm5 5h30v30H15V15zm5 5v20h20V20H20zm5 5h10v10H25V25z' fill='%231a3a7a'/%3E%3C/svg%3E") 30 stretch;
}

/* ── Watermark ── */
.wm {
  position: absolute; top: 40%; left: 50%;
  transform: translate(-50%, -50%);
  width: 70%; opacity: 0.05; pointer-events: none; z-index: 0;
}

.content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }

/* ── Header ── */
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  margin-bottom: 5px;
}
.hdr-logo { width: 75px; text-align: left; }
.hdr-logo img { width: 100%; }

.hdr-main { flex: 1; padding: 0 10px; }
.hdr-t1 { font-size: 14pt; font-weight: bold; color: #1a3a7a; }
.hdr-t1-sub { font-size: 7.5pt; color: #444; margin-bottom: 3px; }
.hdr-t2 { font-size: 13pt; font-weight: bold; color: #000; }
.hdr-t2-sub { font-size: 9pt; font-weight: bold; color: #444; }
.hdr-cin { font-size: 7pt; color: #555; }
.hdr-addr { font-size: 7.5pt; color: #444; margin-top: 5px; line-height: 1.2; }

.hdr-photo {
  width: 90px; height: 110px; border: 1px solid #999;
  display: flex; align-items: center; justify-content: center;
  font-size: 7.5pt; color: #999; background: #fafafa;
  overflow: hidden;
}
.hdr-photo img { width: 100%; height: 100%; object-fit: cover; }

/* ── Title ── */
.cert-title {
  border: 1px solid #333;
  padding: 8px;
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 10px 0;
  background: #f9f9f9;
}

/* ── Salutation ── */
.salute { font-size: 10.5pt; margin-bottom: 8px; font-weight: 500; }
.intro-text { font-size: 10pt; line-height: 1.4; text-align: justify; margin-bottom: 12px; }

/* ── Sections ── */
.sec-title {
  font-size: 10.5pt; font-weight: bold; color: #8B0000;
  text-transform: uppercase;
  border-bottom: 1px solid #8B0000;
  margin: 15px 0 5px;
  padding-bottom: 2px;
}

table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
th, td { border: 1px solid #666; padding: 5px 8px; font-size: 9pt; text-align: left; }
th { background: #e0e0e0; font-weight: bold; }

/* ── Maturity Section ── */
.mat-sec { margin-top: 15px; font-size: 9.5pt; line-height: 1.8; }
.mat-sec b { font-weight: bold; }

/* ── Footer / Signatures ── */
.footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 10px;
  position: relative;
}
.sig-box { text-align: center; width: 220px; font-size: 9pt; border-top: 1px solid #333; padding-top: 5px; }
.stamp-pos {
  position: absolute; left: 50%; bottom: 0px; transform: translateX(-50%);
}

.powered { text-align: center; font-size: 7.5pt; color: #888; border-top: 1px solid #eee; padding-top: 5px; }

@media print {
  body { background: #fff; padding: 0; }
  .actions { display: none; }
  .page { border: none; margin: 0; box-shadow: none; }
}
</style>
</head>
<body>

<div class="actions">
  <button class="btn btn-p" onclick="window.print()">Print / Download PDF</button>
</div>

<div class="page">
  <div class="border-frame">
    
    <div class="wm" style="display:flex;align-items:center;justify-content:center;font-size:80pt;font-weight:900;color:rgba(30,58,138,0.04);letter-spacing:10px;position:absolute;width:100%;height:100%;user-select:none;pointer-events:none;">E SHOPY</div>

    <div class="content">
      <!-- HEADER -->
      <header class="hdr">
        <div class="hdr-logo" style="width: auto; text-align: left;">
          <div style="font-size: 20pt; font-weight: 900; color: #1a3a7a; letter-spacing: 1px;">E SHOPY</div>
        </div>
        <div class="hdr-main">
          <div class="hdr-t1">E SHOPY</div>
          <div class="hdr-t1-sub">(CIN = U64990KA2025PTC212899)</div>
          <div class="hdr-t2">E SHOPY</div>
          <div class="hdr-t2-sub">(E SHOPY FOUNDATION)</div>
          <div class="hdr-cin">(CIN = U85300DL2022NPL407403/ROC)</div>
          <div class="hdr-addr">
            Tel: +91 8394232300 | Email: support@eshopy.com<br/>
            Branch Address: ASHA CHANDRA TRADE CENTER OPPOSITE COURT ROAD UDUPI Karnataka - 576101
          </div>
        </div>
        <div class="hdr-photo">
          ${profilePhotoDataUrl ? `< img src = "${profilePhotoDataUrl}" alt = "Profile Photo" /> ` : 'Passport Photo'}
        </div>
      </header>

      <!-- TITLE -->
      <div class="cert-title">FD CERTIFICATE</div>

      <!-- SALUTATION -->
      <div class="salute">Dear ${data.memberName ? `Mr./ Ms. ${data.memberName}, ` : 'Member,'}</div>
      <p class="intro-text">
        In response to your application dated <strong>${commDate}</strong>, we are pleased to accept your application for deposit under new scheme per details furnished here under. The term deposit shall be governed by the terms of agreement and general terms and conditions printed over leaf.
      </p>

      <!-- BOND HOLDER DETAILS -->
      <div class="sec-title">BOND HOLDER DETAILS</div>
      <table>
        <tr>
          <th style="width:18%">Member Number</th>
          <th style="width:22%">Name</th>
          <th style="width:12%">DOB</th>
          <th style="width:23%">Father's Name / Spouse Name</th>
          <th>Address</th>
        </tr>
        <tr>
          <td>${data.memberNumber || ''}</td>
          <td>${data.memberName || ''}</td>
          <td>${data.dob ? fmt(data.dob) : ''}</td>
          <td>${data.fatherName || ''}</td>
          <td style="font-size: 8pt;">${data.address || ''}</td>
        </tr>
      </table>

      <!-- BOND DETAILS -->
      <div class="sec-title">BOND DETAILS</div>
      <table>
        <tr>
          <th>Account No.</th>
          <th>Commencement Date</th>
          <th>Plan/Term</th>
          <th>Plan Amount</th>
          <th>Interest Rate</th>
        </tr>
        <tr>
          <td>${data.accountNo}</td>
          <td>${commDate}</td>
          <td>${data.planTerm || 'FD / 365 days'}</td>
          <td>${data.planAmount}.0</td>
          <td>${interestRate.toFixed(1)}</td>
        </tr>
      </table>

      <!-- KYC & NOMINEE -->
      <div class="sec-title">KYC DETAILS</div>
      <table>
        <tr>
          <th style="width: 25%">Aadhaar No.</th>
          <td style="width: 25%">${data.aadhaarNo || ''}</td>
          <th style="width: 25%">PAN No.</th>
          <td>${data.panNo || ''}</td>
        </tr>
      </table>

      <div class="sec-title">NOMINEE DETAILS</div>
      <table>
        <tr>
          <th style="width: 25%">Nominee Name</th>
          <td style="width: 25%">${data.nomineeName || ''}</td>
          <th style="width: 25%">Relation</th>
          <td>${data.nomineeRelation || ''}</td>
        </tr>
      </table>

      <!-- MATURITY -->
      <div class="mat-sec">
        <div><b>Maturity Amount:</b> ${maturityAmt}.0</div>
        <div><b>Maturity Date:</b> ${matDate}</div>
        <div><b>Maturity Amount in Words:</b> ${matWords}</div>
        <div><b>Branch Code:</b> ${data.branchCode || '004'}</div>
        <div><b>Branch:</b> ${data.branch || 'UDUPI'}</div>
        <div style="margin-top: 10px;">Regards:-</div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="sig-box">Bond Holder Signature</div>
        <div class="stamp-pos">${stamp}</div>
        <div class="sig-box">Authorized Signatory</div>
      </div>

      <div class="powered">Powered by E shopy</div>
    </div>
  </div>
</div>

</body>
</html>`;
};

// ─── Open in new tab ─────────────────────────────────────────────────────────

export const openBondCertificate = async (data: BondData): Promise<void> => {
  let logoDataUrl = '';

  // Resolve profile photo
  let profilePhotoDataUrl = '';
  if (data.profilePhotoUrl) {
    try {
      profilePhotoDataUrl = await toBase64DataUrl(data.profilePhotoUrl);
    } catch {
      profilePhotoDataUrl = data.profilePhotoUrl;
      console.warn('BondCertificate: could not convert profile photo to base64');
    }
  }

  const html = generateBondCertificate(data, logoDataUrl, profilePhotoDataUrl);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'width=1000,height=860,scrollbars=yes,resizable=yes');
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
};
