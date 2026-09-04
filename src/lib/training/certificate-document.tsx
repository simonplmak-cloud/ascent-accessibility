import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Credential } from "@/db/repository/training-repository";
import { curriculumFor } from "./curriculum";

const styles = StyleSheet.create({
  page: {
    paddingTop: 80,
    paddingHorizontal: 60,
    fontSize: 11,
    color: "#1f2328",
  },
  org: { fontSize: 14, fontWeight: 700, textAlign: "center", color: "#59636e" },
  title: { fontSize: 28, fontWeight: 700, textAlign: "center", marginTop: 40 },
  awardedTo: { fontSize: 11, textAlign: "center", marginTop: 32, color: "#59636e" },
  name: { fontSize: 24, fontWeight: 700, textAlign: "center", marginTop: 8 },
  body: { fontSize: 11, textAlign: "center", marginTop: 24, color: "#1f2328" },
  path: { fontSize: 14, fontWeight: 700, textAlign: "center", marginTop: 8 },
  meta: { fontSize: 10, textAlign: "center", marginTop: 16, color: "#59636e" },
  footer: { position: "absolute", bottom: 48, left: 60, right: 60, fontSize: 9, textAlign: "center", color: "#59636e" },
});

interface CertificateText {
  title: string;
  certifies: string;
  learner: string;
  hasCompleted: string;
  completed: string;
  score: string;
  credentialId: string;
  verifyAt: string;
}

const CERT_TEXT: { en: CertificateText; "zh-Hant": CertificateText; "zh-Hans": CertificateText } = {
  en: {
    title: "Certificate of Completion",
    certifies: "This certifies that",
    learner: "Learner",
    hasCompleted: "has completed",
    completed: "Completed",
    score: "Score",
    credentialId: "Credential ID",
    verifyAt: "Verify at",
  },
  "zh-Hant": {
    title: "結業證書",
    certifies: "茲證明",
    learner: "學員",
    hasCompleted: "已完成",
    completed: "完成於",
    score: "分數",
    credentialId: "憑證編號",
    verifyAt: "於",
  },
  "zh-Hans": {
    title: "结业证书",
    certifies: "兹证明",
    learner: "学员",
    hasCompleted: "已完成",
    completed: "完成于",
    score: "分数",
    credentialId: "凭证编号",
    verifyAt: "于",
  },
};

export function CertificateDocument({
  credential,
  locale,
}: {
  credential: Credential;
  locale?: string;
}) {
  const text: CertificateText =
    locale === "zh-Hant" ? CERT_TEXT["zh-Hant"] : locale === "zh-Hans" ? CERT_TEXT["zh-Hans"] : CERT_TEXT.en;
  const pathTitle = curriculumFor(locale).path.title;
  const completed = new Date(credential.completedAt);
  const date = Number.isNaN(completed.getTime()) ? credential.completedAt : completed.toISOString().slice(0, 10);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.org}>Ascent Accessibility</Text>
          <Text style={styles.title}>{text.title}</Text>
          <Text style={styles.awardedTo}>{text.certifies}</Text>
          <Text style={styles.name}>{credential.name || text.learner}</Text>
          <Text style={styles.body}>{text.hasCompleted}</Text>
          <Text style={styles.path}>
            {pathTitle} (v{credential.pathVersion})
          </Text>
          <Text style={styles.meta}>
            {text.completed} {date}
            {credential.score != null ? ` · ${text.score} ${credential.score}%` : ""}
          </Text>
        </View>
        <Text style={styles.footer}>
          {text.credentialId} {credential.id} · {text.verifyAt} accessibility.ascent.partners/training/certificate/{credential.id}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(credential: Credential, locale?: string): Promise<Buffer> {
  return renderToBuffer(
    <CertificateDocument credential={credential} {...(locale !== undefined ? { locale } : {})} />,
  );
}
