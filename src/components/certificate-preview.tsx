import { Button } from "@/components/ui/button";
import { Award, Printer } from "lucide-react";

type CertificatePreviewProps = {
  studentName: string;
  studentEmail?: string | null;
  issuedAt?: string | null;
  certificateId?: string;
  showPrintButton?: boolean;
};

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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-secondary/40 bg-background p-4 shadow-sm">
        <div className="relative overflow-hidden rounded-xl border-4 border-double border-secondary bg-card px-6 py-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary/15 text-secondary">
            <Award className="h-8 w-8" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Certificate of Completion
          </p>
          <h2 className="mt-3 text-3xl font-bold text-primary">
            BIM Platform
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
            This certificate is awarded to
          </p>
          <div className="mx-auto mt-2 max-w-xl border-b border-secondary pb-2 text-4xl font-bold text-primary">
            {displayName}
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-foreground">
            for successfully completing the full 45-day BIM learning course,
            including all lesson quizzes and module assessments.
          </p>

          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
            <CertificateField label="Issued Date" value={formattedDate} />
            <CertificateField label="Issued By" value="SkillArion" />
            <CertificateField
              label="Certificate ID"
              value={certificateId || "BIM-CERT"}
            />
          </div>

          {studentEmail && (
            <p className="mt-5 text-xs text-muted-foreground">
              Registered email: {studentEmail}
            </p>
          )}
        </div>
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
              certificateId: certificateId || "BIM-CERT",
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

function CertificateField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-semibold text-primary">{value}</p>
    </div>
  );
}

function printCertificate({
  studentName,
  studentEmail,
  issuedDate,
  certificateId,
}: {
  studentName: string;
  studentEmail?: string | null;
  issuedDate: string;
  certificateId: string;
}) {
  const printWindow = window.open("", "_blank", "width=1100,height=800");
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
            padding: 32px;
            color: #17124f;
            font-family: Georgia, 'Times New Roman', serif;
            background: #f8f5ec;
          }
          .certificate {
            min-height: 720px;
            border: 10px double #b69a4a;
            background: #fffdf7;
            padding: 54px 64px;
            text-align: center;
          }
          .seal {
            width: 84px;
            height: 84px;
            margin: 0 auto;
            border-radius: 50%;
            display: grid;
            place-items: center;
            color: #b69a4a;
            border: 2px solid #b69a4a;
            font-size: 42px;
          }
          .eyebrow {
            margin-top: 30px;
            font: 700 14px Arial, sans-serif;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: #6f6684;
          }
          h1 {
            margin: 14px 0 0;
            font-size: 48px;
          }
          .awarded {
            margin-top: 46px;
            font: 18px Arial, sans-serif;
            color: #6f6684;
          }
          .name {
            display: inline-block;
            min-width: 62%;
            margin-top: 12px;
            padding-bottom: 12px;
            border-bottom: 2px solid #b69a4a;
            font-size: 54px;
            font-weight: 700;
          }
          .body {
            max-width: 760px;
            margin: 38px auto 0;
            font: 20px/1.7 Arial, sans-serif;
            color: #241f5f;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
            margin-top: 70px;
            font-family: Arial, sans-serif;
          }
          .meta span {
            display: block;
            color: #6f6684;
            font-size: 12px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .meta strong {
            display: block;
            margin-top: 8px;
            font-size: 16px;
          }
          .email {
            margin-top: 34px;
            font: 13px Arial, sans-serif;
            color: #6f6684;
          }
          @page { size: landscape; margin: 12mm; }
        </style>
      </head>
      <body>
        <main class="certificate">
          <div class="seal">S</div>
          <div class="eyebrow">Certificate of Completion</div>
          <h1>BIM Platform</h1>
          <div class="awarded">This certificate is awarded to</div>
          <div class="name">${escapeHtml(studentName)}</div>
          <p class="body">
            for successfully completing the full 45-day BIM learning course,
            including all lesson quizzes and module assessments.
          </p>
          <section class="meta">
            <div><span>Issued Date</span><strong>${escapeHtml(issuedDate)}</strong></div>
            <div><span>Issued By</span><strong>SkillArion</strong></div>
            <div><span>Certificate ID</span><strong>${escapeHtml(certificateId)}</strong></div>
          </section>
          ${
            studentEmail
              ? `<p class="email">Registered email: ${escapeHtml(studentEmail)}</p>`
              : ""
          }
        </main>
        <script>
          window.onload = () => {
            window.print();
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
