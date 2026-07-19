/**
 * Welcome email sent to new newsletter subscribers.
 */

import * as React from "react";
import { Heading, Text, Link, Button, Row, Column, Section } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { generateUnsubscribeUrl } from "../config";
import { NewsletterWelcomeParams } from "../types";
import {
  h2Style,
  h3Style,
  pStyle,
  cardHighlightStyle,
  cardStyle,
  btnStyle,
  btnSecondaryStyle,
  signatureStyle,
  colors,
} from "./styles";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type NewsletterWelcomeEmailProps = NewsletterWelcomeParams;

export function NewsletterWelcomeEmail({
  name,
  subscriberId,
  preferences,
  unsubscribeUrl,
}: NewsletterWelcomeEmailProps) {
  const displayName = name || "there";
  const finalUnsubscribeUrl = unsubscribeUrl || generateUnsubscribeUrl(subscriberId);

  return (
    <EmailLayout
      title="Welcome to My Newsletter!"
      preheader={`Welcome ${displayName}! Thanks for subscribing to my newsletter.`}
      footerNote="Thanks for joining my community!"
      unsubscribeUrl={finalUnsubscribeUrl}
    >
      <Heading as="h2" style={h2Style}>
        Welcome to my newsletter! 🎉
      </Heading>

      <Text style={pStyle}>Hi {displayName},</Text>

      <Text style={pStyle}>
        Thank you for subscribing to my newsletter! I&apos;m excited to have you as part of my
        community and look forward to sharing my journey, insights, and latest work with you.
      </Text>

      <Section style={cardHighlightStyle}>
        <Heading as="h3" style={h3Style}>
          What you can expect
        </Heading>
        <Text style={{ ...pStyle, marginBottom: 0 }}>
          {preferences?.blogUpdates !== false && (
            <>
              • <strong>Blog Updates:</strong> New articles, tutorials, and insights
              <br />
            </>
          )}
          {preferences?.projectUpdates !== false && (
            <>
              • <strong>Project Updates:</strong> Latest work and case studies
              <br />
            </>
          )}
          {preferences?.newsletter !== false && (
            <>
              • <strong>Newsletter:</strong> Monthly roundups and exclusive content
              <br />
            </>
          )}
          • <strong>Behind the scenes:</strong> Development process and lessons learned
          <br />• <strong>Industry insights:</strong> Trends and best practices in web development
        </Text>
      </Section>

      <Section style={cardStyle}>
        <Heading as="h3" style={h3Style}>
          Get started
        </Heading>
        <Text style={pStyle}>While you&apos;re here, why not explore some of my recent work?</Text>
        <Row style={{ textAlign: "center" }}>
          <Column>
            <Button href={`${SITE_URL}/projects`} style={{ ...btnStyle, marginRight: "10px" }}>
              View My Projects
            </Button>
            <Button href={`${SITE_URL}/blog`} style={btnSecondaryStyle}>
              Read Latest Posts
            </Button>
          </Column>
        </Row>
      </Section>

      <Section style={cardStyle}>
        <Heading as="h3" style={h3Style}>
          Stay connected
        </Heading>
        <Text style={pStyle}>
          You can also follow me on social media for more frequent updates and behind-the-scenes
          content:
        </Text>
        <Text style={{ textAlign: "center" }}>
          <Link href="https://github.com/yashdeeptandon" style={{ color: colors.PRIMARY, margin: "0 10px" }}>
            GitHub
          </Link>
          <Link href="https://linkedin.com/in/yashdeep-tandon" style={{ color: colors.PRIMARY, margin: "0 10px" }}>
            LinkedIn
          </Link>
          <Link href="https://twitter.com/YDT007" style={{ color: colors.PRIMARY, margin: "0 10px" }}>
            Twitter
          </Link>
        </Text>
      </Section>

      <Text style={{ marginTop: "30px", fontSize: "14px", color: colors.TEXT_SECONDARY }}>
        You can update your email preferences or unsubscribe at any time using the link in the
        footer of this email.
      </Text>

      <Text style={signatureStyle}>
        Glad to have you here,
        <br />
        <strong style={{ color: colors.TEXT_PRIMARY }}>Yashdeep</strong>
      </Text>
    </EmailLayout>
  );
}

export default NewsletterWelcomeEmail;
