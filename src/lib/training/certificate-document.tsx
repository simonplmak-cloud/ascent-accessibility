import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Credential } from "@/db/repository/training-repository";

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

export function CertificateDocument({ credential }: { credential: Credential }) {
  const completed = new Date(credential.completedAt);
  const date = Number.isNaN(completed.getTime()) ? credential.completedAt : completed.toISOString().slice(0, 10);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.org}>Ascent Accessibility</Text>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.awardedTo}>This certifies that</Text>
          <Text style={styles.name}>{credential.name || "Learner"}</Text>
          <Text style={styles.body}>has completed</Text>
          <Text style={styles.path}>
            {credential.path} (v{credential.pathVersion})
          </Text>
          <Text style={styles.meta}>
            Completed {date}
            {credential.score != null ? ` · Score ${credential.score}%` : ""}
          </Text>
        </View>
        <Text style={styles.footer}>
          Credential ID {credential.id} · Verify at accessibility.ascent.partners/training/certificate/{credential.id}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(credential: Credential): Promise<Buffer> {
  return renderToBuffer(<CertificateDocument credential={credential} />);
}
