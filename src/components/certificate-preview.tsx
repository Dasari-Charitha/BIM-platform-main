import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";
import certificateQr from "@/assets/certificate/reference_7.png";
import signature from "@/assets/certificate/reference_6.png";
import { Printer } from "lucide-react";

type CertificatePreviewProps = {
  studentName: string;
  studentEmail?: string | null;
  issuedAt?: string | null;
  certificateId?: string;
  showPrintButton?: boolean;
};

const CONTACT_PHONE = "+91 76739 25472";
const CONTACT_EMAIL = "info@skillariondevelopment.in";
const WEBSITE = "www.skillariondevelopment.in";

export function CertificatePreview({
  studentName,
  studentEmail,
  issuedAt,
  certificateId,
  showPrintButton = true,
}: CertificatePreviewProps) {
  const displayName = studentName.trim() || "Student";
  const issuedDate = issuedAt ? new Date(issuedAt) : new Date();
  const formattedDate = issuedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const certId = certificateId || "BIM-CERT";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-secondary/30 bg-background p-3 shadow-sm">
        <article className="relative mx-auto max-w-3xl overflow-hidden rounded-xl border-[6px] border-double border-[#c99a2e] bg-[#fffdf7] p-6 text-center text-[#1b1464] shadow-sm">
          <CertificateHeader />

          <p className="mt-5 text-xs font-semibold tracking-[0.28em] text-[#9b7a28]">
            Bridging Academia to Industry Excellence
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-[11px] uppercase tracking-[0.18em] text-[#2f2a74]">
            Govt of India Ministry of Commerce & Industry Dept for Promotion of
            Industry and Internal Trade - DIPP209373
          </p>

          <h2 className="mt-6 font-serif text-4xl font-bold text-[#1b1464]">
            Certificate of Completion
          </h2>

          <p className="mt-6 text-base tracking-[0.18em]">
            This is to certify that
          </p>
          <div className="mx-auto mt-3 max-w-2xl border-b-2 border-[#c99a2e] pb-2 font-serif text-4xl font-bold uppercase tracking-[0.08em] text-[#1b1464]">
            {displayName}
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#241f5f]">
            has successfully completed the 45-day Building Information Modeling
            course at SkillArion Development. The training covered BIM concepts,
            digital construction workflows, model coordination, project
            documentation, and assessment-based learning through lesson quizzes
            and module evaluations.
          </p>

          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
            <CertificateField label="Issued Date" value={formattedDate} />
            <CertificateField label="Issued By" value="SkillArion Development" />
            <CertificateField label="Certificate ID" value={certId} />
          </div>

          {studentEmail && (
            <p className="mt-5 text-xs text-[#5f5784]">
              Registered email: {studentEmail}
            </p>
          )}

          <div className="mt-8 grid items-end gap-6 text-sm sm:grid-cols-3">
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9b7a28]">
                Accredited By
              </p>
              <p className="mt-1 font-semibold">SkillArion Development</p>
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-[#5f5784]">
              <img
                src={certificateQr}
                alt="Certificate verification QR"
                className="h-24 w-24 object-contain"
              />
              <span>Scan to verify</span>
            </div>
            <div className="text-right">
              <img
                src={signature}
                alt="Managing Director signature"
                className="ml-auto h-16 w-32 object-contain"
              />
              <div className="ml-auto h-px w-40 bg-[#1b1464]" />
              <p className="mt-2 font-semibold">Managing Director</p>
            </div>
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-[#5f5784]">
            Govt. of India MSME registered organization - Rec. by AICTE & APCHE
            - Certified by DPIIT
          </p>
        </article>
      </div>

      {showPrintButton && (
        <Button
          type="button"
          className="w-full"
          onClick={() =>
            printCertificate({
              studentName: displayName,
              studentEmail,
              issuedDate: formattedDate,
              certificateId: certId,
              logoUrl: logo,
              qrUrl: certificateQr,
              signatureUrl: signature,
            })
          }
        >
          <Printer className="mr-2 h-4 w-4" />
          Print or Save as PDF
        </Button>
      )}
    </div>
  );
}

function CertificateHeader() {
  return (
    <header>
      <div className="grid gap-3 text-[11px] font-semibold text-[#1b1464] sm:grid-cols-3">
        <span>{WEBSITE}</span>
        <span>{CONTACT_PHONE}</span>
        <span>{CONTACT_EMAIL}</span>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-3">
        <img
          src={logo}
          alt="SkillArion logo"
          className="h-16 w-16 rounded-xl bg-white object-contain p-1 shadow-sm"
        />
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1464]">
            SkillArion Development
          </h1>
        </div>
      </div>
    </header>
  );
}

function CertificateField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-[#9b7a28]">
        {label}
      </p>
      <p className="mt-1 font-semibold text-[#1b1464]">{value}</p>
    </div>
  );
}

function printCertificate({
  studentName,
  studentEmail,
  issuedDate,
  certificateId,
  logoUrl,
  qrUrl,
  signatureUrl,
}: {
  studentName: string;
  studentEmail?: string | null;
  issuedDate: string;
  certificateId: string;
  logoUrl: string;
  qrUrl: string;
  signatureUrl: string;
}) {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Certificate - ${escapeHtml(studentName)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            color: #1b1464;
            font-family: Arial, sans-serif;
            background: #f8f5ec;
          }
          .certificate {
            min-height: 1060px;
            border: 10px double #c99a2e;
            background: #fffdf7;
            padding: 40px 48px;
            text-align: center;
          }
          .top {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            font-size: 12px;
            font-weight: 700;
          }
          .logo {
            width: 76px;
            height: 76px;
            object-fit: contain;
            margin: 34px auto 12px;
            border-radius: 12px;
          }
          h1 {
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 38px;
          }
          .tagline {
            margin-top: 20px;
            color: #9b7a28;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.28em;
          }
          .dipp {
            max-width: 760px;
            margin: 12px auto 0;
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }
          h2 {
            margin: 42px 0 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 48px;
          }
          .certify {
            margin-top: 42px;
            font-size: 18px;
            letter-spacing: 0.18em;
          }
          .name {
            display: inline-block;
            min-width: 70%;
            margin-top: 14px;
            padding-bottom: 12px;
            border-bottom: 2px solid #c99a2e;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 44px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .body {
            max-width: 760px;
            margin: 40px auto 0;
            color: #241f5f;
            font-size: 18px;
            line-height: 1.75;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-top: 54px;
          }
          .meta span,
          .footer-label {
            color: #9b7a28;
            font-size: 12px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }
          .meta strong {
            display: block;
            margin-top: 8px;
            font-size: 16px;
          }
          .email {
            margin-top: 28px;
            color: #5f5784;
            font-size: 13px;
          }
          .bottom {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            align-items: end;
            gap: 36px;
            margin-top: 68px;
            font-size: 15px;
          }
          .left { text-align: left; }
          .right { text-align: right; }
          .qr {
            display: block;
            width: 112px;
            height: 112px;
            object-fit: contain;
            margin: 0 auto 6px;
          }
          .qr-text {
            color: #5f5784;
            font-size: 12px;
          }
          .signature {
            display: block;
            width: 160px;
            height: 76px;
            object-fit: contain;
            margin-left: auto;
          }
          .line {
            width: 180px;
            height: 1px;
            margin-left: auto;
            background: #1b1464;
          }
          .legal {
            margin-top: 44px;
            color: #5f5784;
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }
          @page { size: A4 portrait; margin: 10mm; }
        </style>
      </head>
      <body>
        <main class="certificate">
          <section class="top">
            <span>${WEBSITE}</span>
            <span>${CONTACT_PHONE}</span>
            <span>${CONTACT_EMAIL}</span>
          </section>
          <img class="logo" src="${escapeHtml(logoUrl)}" alt="SkillArion logo" />
          <h1>SkillArion Development</h1>
          <div class="tagline">Bridging Academia to Industry Excellence</div>
          <p class="dipp">
            Govt of India Ministry of Commerce & Industry Dept for Promotion of
            Industry and Internal Trade - DIPP209373
          </p>
          <h2>Certificate of Completion</h2>
          <div class="certify">This is to certify that</div>
          <div class="name">${escapeHtml(studentName)}</div>
          <p class="body">
            has successfully completed the 45-day Building Information Modeling
            course at SkillArion Development. The training covered BIM concepts,
            digital construction workflows, model coordination, project
            documentation, and assessment-based learning through lesson quizzes
            and module evaluations.
          </p>
          <section class="meta">
            <div><span>Issued Date</span><strong>${escapeHtml(issuedDate)}</strong></div>
            <div><span>Issued By</span><strong>SkillArion Development</strong></div>
            <div><span>Certificate ID</span><strong>${escapeHtml(certificateId)}</strong></div>
          </section>
          ${
            studentEmail
              ? `<p class="email">Registered email: ${escapeHtml(studentEmail)}</p>`
              : ""
          }
          <section class="bottom">
            <div class="left">
              <div class="footer-label">Accredited By</div>
              <strong>SkillArion Development</strong>
            </div>
            <div>
              <img class="qr" src="${escapeHtml(qrUrl)}" alt="Certificate verification QR" />
              <div class="qr-text">Scan to verify</div>
            </div>
            <div class="right">
              <img class="signature" src="${escapeHtml(signatureUrl)}" alt="Managing Director signature" />
              <div class="line"></div>
              <strong>Managing Director</strong>
            </div>
          </section>
          <p class="legal">
            Govt. of India MSME registered organization - Rec. by AICTE & APCHE
            - Certified by DPIIT
          </p>
        </main>
        <script>
          window.onload = () => window.print();
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
