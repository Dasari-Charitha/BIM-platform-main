import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";
import signature from "@/assets/certificate/reference_6.png";
import stamp from "@/assets/certificate/stamp.png";
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
const VERIFY_TEXT =
  "To verify certificate contact to info@SkillArionDevelopment";

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
        <article className="relative mx-auto max-w-3xl overflow-hidden rounded-xl border-[6px] border-double border-[#c99a2e] bg-[#fffdf7] p-6 text-center text-[#1b1464] shadow-[0_18px_45px_rgba(27,20,100,0.18)]">
          <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 rounded-br-full bg-[#1b1464]/10" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-tl-full bg-[#c99a2e]/15" />

          <img
            src={logo}
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[360px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.18]"
          />

          <div className="relative z-10">
            <CertificateHeader />

            <p className="mt-4 font-['Brush_Script_MT',cursive] text-xl tracking-wide text-[#9b7a28]">
              Bridging Academia to Industry Excellence
            </p>

            <p className="mx-auto mt-2 max-w-2xl font-serif text-[11px] uppercase tracking-[0.18em] text-[#2f2a74]">
              Govt of India Ministry of Commerce & Industry Dept for Promotion
              of Industry and Internal Trade - DIPP209373
            </p>

            <h2 className="mt-6 font-serif text-4xl font-bold underline underline-offset-4 text-[#1b1464]">
              Certificate of Completion
            </h2>

            <p className="mt-5 font-['Brush_Script_MT',cursive] text-3xl text-black">
              This is certify that
            </p>

            <div className="mx-auto mt-3 max-w-2xl border-b-2 border-black pb-1 font-serif text-4xl font-bold uppercase tracking-wide text-black">
              {displayName}
            </div>

            <p className="mx-auto mt-6 max-w-2xl font-serif text-base leading-8 text-black">
              has successfully completed the 45-day{" "}
              <strong>Building Information Modeling</strong> course at
              SkillArion Development. The training covered BIM concepts, digital
              construction workflows, model coordination, project documentation,
              and assessment-based learning through lesson quizzes and module
              evaluations.
            </p>

            <div className="mt-7 grid gap-4 text-sm sm:grid-cols-3">
              <CertificateField label="Issued Date" value={formattedDate} />
              <CertificateField
                label="Issued By"
                value="SkillArion Development"
              />
              <CertificateField label="Certificate ID" value={certId} />
            </div>

            {studentEmail && (
              <p className="mt-4 font-serif text-xs text-[#5f5784]">
                Registered email: {studentEmail}
              </p>
            )}

            <div className="mt-6 grid items-end gap-6 text-sm sm:grid-cols-3">
              <div className="text-left font-serif">
                <p className="text-xs uppercase tracking-[0.16em] text-[#9b7a28]">
                  Accredited By
                </p>
                <p className="mt-1 font-bold text-black">
                  SkillArion Development
                </p>
              </div>

              <div className="flex flex-col items-center justify-end gap-2">
                <img
                  src={stamp}
                  alt="SkillArion stamp"
                  className="h-16 w-16 object-contain opacity-90"
                />

                <p className="rounded-lg border border-[#c99a2e]/40 bg-white/60 px-3 py-2 text-center font-serif text-xs font-semibold leading-5 text-[#5f5784] shadow-sm">
                  {VERIFY_TEXT}
                </p>
              </div>

              <div className="text-right font-serif">
                <img
                  src={signature}
                  alt="Managing Director signature"
                  className="ml-auto h-16 w-32 object-contain"
                />
                <div className="ml-auto h-px w-40 bg-black" />
                <p className="mt-2 font-bold text-black">Managing Director</p>
              </div>
            </div>

            <p className="mt-5 font-serif text-[10px] uppercase tracking-[0.16em] text-[#5f5784]">
              Govt. of India MSME registered organization - Rec. by AICTE &
              APCHE - Certified by DPIIT
            </p>
          </div>
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
              signatureUrl: signature,
              stampUrl: stamp,
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
      <div className="grid gap-3 font-serif text-[11px] font-bold text-[#1b1464] sm:grid-cols-3">
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

        <h1 className="font-serif text-4xl font-bold text-[#1b1464]">
          SkillArion Development
        </h1>
      </div>
    </header>
  );
}

function CertificateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="font-serif">
      <p className="text-xs uppercase tracking-[0.16em] text-[#9b7a28]">
        {label}
      </p>
      <p className="mt-1 font-bold text-black">{value}</p>
    </div>
  );
}

function printCertificate({
  studentName,
  studentEmail,
  issuedDate,
  certificateId,
  logoUrl,
  signatureUrl,
  stampUrl,
}: {
  studentName: string;
  studentEmail?: string | null;
  issuedDate: string;
  certificateId: string;
  logoUrl: string;
  signatureUrl: string;
  stampUrl: string;
}) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Certificate - ${escapeHtml(studentName)}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }

          * { box-sizing: border-box; }

          html,
          body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: white;
            font-family: Georgia, 'Times New Roman', serif;
          }

          .certificate {
            position: relative;
            overflow: hidden;
            width: 190mm;
            height: 277mm;
            margin: 10mm auto;
            border: 8px double #c99a2e;
            background: #fffdf7;
            padding: 22px 38px;
            text-align: center;
            color: #1b1464;
            page-break-inside: avoid;
          }

          .corner-one {
            position: absolute;
            left: 0;
            top: 0;
            width: 120px;
            height: 120px;
            border-bottom-right-radius: 100%;
            background: rgba(27, 20, 100, 0.08);
          }

          .corner-two {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 140px;
            height: 140px;
            border-top-left-radius: 100%;
            background: rgba(201, 154, 46, 0.14);
          }

          .watermark {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 430px;
            transform: translate(-50%, -50%);
            opacity: 0.18;
            object-fit: contain;
            pointer-events: none;
          }

          .content {
            position: relative;
            z-index: 2;
          }

          .top {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            font-size: 11px;
            font-weight: 700;
          }

          .logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
            margin: 20px auto 10px;
            border-radius: 12px;
          }

          h1 {
            margin: 0;
            font-size: 34px;
            font-weight: 700;
          }

          .tagline {
            margin-top: 12px;
            color: #9b7a28;
            font-family: 'Brush Script MT', cursive;
            font-size: 26px;
            letter-spacing: 0.03em;
          }

          .dipp {
            max-width: 760px;
            margin: 10px auto 0;
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          h2 {
            margin: 24px 0 0;
            font-size: 42px;
            font-weight: 700;
            text-decoration: underline;
            text-underline-offset: 4px;
          }

          .certify {
            margin-top: 18px;
            color: black;
            font-family: 'Brush Script MT', cursive;
            font-size: 32px;
          }

          .name {
            display: inline-block;
            min-width: 70%;
            margin-top: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid black;
            color: black;
            font-size: 38px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .body {
            max-width: 760px;
            margin: 22px auto 0;
            color: black;
            font-size: 17px;
            line-height: 1.55;
          }

          .meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 28px;
          }

          .meta span,
          .footer-label {
            color: #9b7a28;
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .meta strong {
            display: block;
            margin-top: 6px;
            color: black;
            font-size: 14px;
          }

          .email {
            margin-top: 16px;
            color: #5f5784;
            font-size: 12px;
          }

          .bottom {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            align-items: end;
            gap: 26px;
            margin-top: 28px;
            font-size: 14px;
          }

          .left { text-align: left; }
          .right { text-align: right; }

          .stamp {
            display: block;
            width: 64px;
            height: 64px;
            object-fit: contain;
            margin: 0 auto 8px;
            opacity: 0.9;
          }

          .verify-text {
            color: #5f5784;
            font-size: 12px;
            font-weight: 700;
            line-height: 1.5;
            text-align: center;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid rgba(201,154,46,0.4);
            background: rgba(255,255,255,0.6);
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }

          .signature {
            display: block;
            width: 140px;
            height: 66px;
            object-fit: contain;
            margin-left: auto;
          }

          .line {
            width: 160px;
            height: 1px;
            margin-left: auto;
            background: black;
          }

          .legal {
            margin-top: 14px;
            color: #5f5784;
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }
        </style>
      </head>

      <body>
        <main class="certificate">
          <div class="corner-one"></div>
          <div class="corner-two"></div>
          <img class="watermark" src="${escapeHtml(logoUrl)}" alt="" />

          <div class="content">
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

            <div class="certify">This is certify that</div>

            <div class="name">${escapeHtml(studentName)}</div>

            <p class="body">
              has successfully completed the 45-day
              <strong> Building Information Modeling</strong>
              course at SkillArion Development. The training covered BIM
              concepts, digital construction workflows, model coordination,
              project documentation, and assessment-based learning through
              lesson quizzes and module evaluations.
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
                <strong style="color:black;">SkillArion Development</strong>
              </div>

              <div>
                <img class="stamp" src="${escapeHtml(stampUrl)}" alt="SkillArion stamp" />
                <div class="verify-text">${VERIFY_TEXT}</div>
              </div>

              <div class="right">
                <img class="signature" src="${escapeHtml(signatureUrl)}" alt="Managing Director signature" />
                <div class="line"></div>
                <strong style="color:black;">Managing Director</strong>
              </div>
            </section>

            <p class="legal">
              Govt. of India MSME registered organization - Rec. by AICTE &
              APCHE - Certified by DPIIT
            </p>
          </div>
        </main>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
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