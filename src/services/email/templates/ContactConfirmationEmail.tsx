/**
 * Auto-reply sent to the visitor after they submit the contact form.
 */

import * as React from "react";
import { Heading, Text, Button, Row, Column, Section } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { truncateText } from "../config";
import { ContactConfirmationParams } from "../types";
import {
  h2Style,
  h3Style,
  pStyle,
  cardHighlightStyle,
  cardStyle,
  messageBlockStyle,
  btnStyle,
  btnSecondaryStyle,
  colors,
} from "./styles";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type ContactConfirmationEmailProps = ContactConfirmationParams;

export function ContactConfirmationEmail({
  contactData,
  submissionId,
  expectedResponseTime,
}: ContactConfirmationEmailProps) {
  const responseTime = expectedResponseTime || "24-48 hours";

  return (
    <EmailLayout
      title="Message Received - Thank You!"
      preheader={`Thank you for contacting me, ${contactData.name}! I'll get back to you soon.`}
      footerNote="I look forward to connecting with you soon!"
    >
      <Heading as="h2" style={h2Style}>
        Thank you for reaching out!
      </Heading>

      <Text style={pStyle}>Hi {contactData.name},</Text>

      <Text style={pStyle}>
        I&apos;ve received your message and wanted to confirm that it has been successfully
        submitted. I appreciate you taking the time to get in touch with me.
      </Text>

      <Section style={cardHighlightStyle}>
        <Heading as="h3" style={h3Style}>
          Your Message Summary
        </Heading>
        {contactData.subject && (
          <Text style={pStyle}>
            <strong>Subject:</strong> {contactData.subject}
          </Text>
        )}
        <Text style={{ ...pStyle, marginBottom: "8px" }}>
          <strong>Message:</strong>
        </Text>
        <Text style={messageBlockStyle}>{truncateText(contactData.message, 300)}</Text>
        <Text style={{ fontSize: "12px", color: colors.TEXT_SECONDARY, marginTop: "12px", marginBottom: 0 }}>
          <strong>Reference ID:</strong> {submissionId}
        </Text>
      </Section>

      <Section style={cardStyle}>
        <Heading as="h3" style={h3Style}>
          What happens next?
        </Heading>
        <Text style={pStyle}>
          I typically respond to all inquiries within <strong>{responseTime}</strong>. I&apos;ll
          get back to you at <strong>{contactData.email}</strong> as soon as possible.
        </Text>
        <Text style={{ ...pStyle, marginBottom: "8px" }}>In the meantime, feel free to:</Text>
        <Text style={pStyle}>
          • Check out my latest projects on my portfolio
          <br />• Read my blog for insights and updates
          <br />• Connect with me on social media
        </Text>
      </Section>

      <Row style={{ marginTop: "30px", textAlign: "center" }}>
        <Column>
          <Button href={SITE_URL} style={{ ...btnStyle, marginRight: "10px" }}>
            Visit My Portfolio
          </Button>
          <Button href={`${SITE_URL}/blog`} style={btnSecondaryStyle}>
            Read My Blog
          </Button>
        </Column>
      </Row>

      <Text style={{ marginTop: "30px", fontSize: "14px", color: colors.TEXT_SECONDARY }}>
        If you have any urgent questions or need to add additional information to your inquiry,
        please reply to this email with your reference ID: <strong>{submissionId}</strong>
      </Text>
    </EmailLayout>
  );
}

export default ContactConfirmationEmail;
