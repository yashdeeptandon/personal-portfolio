/**
 * Admin notification email — sent to ADMIN_EMAIL when someone submits the contact form.
 */

import * as React from "react";
import { Heading, Text, Link, Button, Row, Column, Section } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { formatEmailDate, truncateText } from "../config";
import { ContactNotificationParams } from "../types";
import {
  h2Style,
  h3Style,
  pStyle,
  cardStyle,
  cardHighlightStyle,
  messageBlockStyle,
  btnStyle,
  btnSecondaryStyle,
  colors,
} from "./styles";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type ContactNotificationEmailProps = ContactNotificationParams;

export function ContactNotificationEmail({
  contactData,
  submissionId,
  submissionDate,
  ipAddress,
  userAgent,
}: ContactNotificationEmailProps) {
  const date = submissionDate || new Date();

  return (
    <EmailLayout
      title="New Contact Form Submission"
      preheader={`New message from ${contactData.name} - ${truncateText(contactData.message, 100)}`}
      footerNote="This is an automated notification from your portfolio website."
    >
      <Heading as="h2" style={h2Style}>
        New Contact Form Submission
      </Heading>

      <Section style={cardHighlightStyle}>
        <Heading as="h3" style={h3Style}>
          Contact Details
        </Heading>
        <Text style={pStyle}>
          <strong>Name:</strong> {contactData.name}
        </Text>
        <Text style={pStyle}>
          <strong>Email:</strong>{" "}
          <Link href={`mailto:${contactData.email}`} style={{ color: colors.PRIMARY }}>
            {contactData.email}
          </Link>
        </Text>
        {contactData.phone && (
          <Text style={pStyle}>
            <strong>Phone:</strong> {contactData.phone}
          </Text>
        )}
        {contactData.company && (
          <Text style={pStyle}>
            <strong>Company:</strong> {contactData.company}
          </Text>
        )}
        {contactData.subject && (
          <Text style={{ ...pStyle, marginBottom: 0 }}>
            <strong>Subject:</strong> {contactData.subject}
          </Text>
        )}
      </Section>

      <Section style={cardStyle}>
        <Heading as="h3" style={h3Style}>
          Message
        </Heading>
        <Text style={messageBlockStyle}>{contactData.message}</Text>
      </Section>

      <Section style={cardStyle}>
        <Heading as="h3" style={h3Style}>
          Submission Information
        </Heading>
        <Text style={pStyle}>
          <strong>Submission ID:</strong> {submissionId}
        </Text>
        <Text style={pStyle}>
          <strong>Date &amp; Time:</strong> {formatEmailDate(date)}
        </Text>
        {ipAddress && (
          <Text style={pStyle}>
            <strong>IP Address:</strong> {ipAddress}
          </Text>
        )}
        {userAgent && (
          <Text style={{ ...pStyle, fontSize: "12px", color: colors.TEXT_SECONDARY, marginBottom: 0 }}>
            <strong>User Agent:</strong> {truncateText(userAgent, 100)}
          </Text>
        )}
      </Section>

      <Row style={{ marginTop: "30px", textAlign: "center" }}>
        <Column>
          <Button
            href={`mailto:${contactData.email}?subject=${encodeURIComponent(
              `Re: ${contactData.subject || "Your inquiry"}`
            )}`}
            style={{ ...btnStyle, marginRight: "10px" }}
          >
            Reply to {contactData.name}
          </Button>
          <Button href={`${SITE_URL}/admin/contact`} style={btnSecondaryStyle}>
            View in Admin Panel
          </Button>
        </Column>
      </Row>
    </EmailLayout>
  );
}

export default ContactNotificationEmail;
