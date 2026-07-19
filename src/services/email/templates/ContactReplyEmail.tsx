/**
 * Reply sent from the admin contact dashboard to a visitor who submitted
 * the contact form.
 */

import * as React from "react";
import { Heading, Text, Section } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { pStyle, cardStyle, messageBlockStyle, signatureStyle, colors } from "./styles";

export interface ContactReplyEmailProps {
  name: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
}

export function ContactReplyEmail({
  name,
  originalSubject,
  originalMessage,
  replyMessage,
}: ContactReplyEmailProps) {
  return (
    <EmailLayout
      title={`Re: ${originalSubject}`}
      preheader={`Yashdeep replied to your message: ${originalSubject}`}
      footerNote="Thanks again for reaching out!"
    >
      <Heading as="h2" style={{ margin: "0 0 20px 0", fontWeight: 600, lineHeight: 1.3, fontSize: "24px", color: colors.TEXT_PRIMARY }}>
        Hi {name},
      </Heading>

      <Text style={{ ...pStyle, whiteSpace: "pre-wrap" }}>{replyMessage}</Text>

      <Section style={cardStyle}>
        <Text style={{ ...pStyle, marginBottom: "8px", fontSize: "12px", color: colors.TEXT_SECONDARY }}>
          Your original message — &quot;{originalSubject}&quot;
        </Text>
        <Text style={messageBlockStyle}>{originalMessage}</Text>
      </Section>

      <Text style={{ marginTop: "30px", fontSize: "14px", color: colors.TEXT_SECONDARY }}>
        Just reply directly to this email if you have any follow-up questions.
      </Text>

      <Text style={signatureStyle}>
        Best,
        <br />
        <strong style={{ color: colors.TEXT_PRIMARY }}>Yashdeep</strong>
      </Text>
    </EmailLayout>
  );
}

export default ContactReplyEmail;
