/**
 * Shared layout for every transactional email in the app.
 * Owns the <html>/<head>/header/footer once; individual templates only
 * ever provide their own body content via `children`.
 */

import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
} from "@react-email/components";
import {
  bodyStyle,
  containerStyle,
  headerStyle,
  headerTitleStyle,
  bodyPaddingStyle,
  footerStyle,
  avatarStyle,
  roleTagStyle,
  colors,
} from "./styles";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const AVATAR_URL = `${SITE_URL}/avatar.jpg`;

export interface EmailLayoutProps {
  title: string;
  preheader?: string;
  footerNote?: string;
  unsubscribeUrl?: string;
  children: React.ReactNode;
}

export function EmailLayout({
  title,
  preheader,
  footerNote,
  unsubscribeUrl,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{title}</title>
      </Head>
      {preheader && <Preview>{preheader}</Preview>}
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Img src={AVATAR_URL} width={64} height={64} alt="Yashdeep Tandon" style={avatarStyle} />
            <Text style={headerTitleStyle}>Yashdeep Tandon</Text>
            <span style={roleTagStyle}>Sr. Software Engineer</span>
          </Section>

          <Section style={bodyPaddingStyle}>{children}</Section>

          <Section style={footerStyle}>
            <Text style={{ margin: "0 0 10px 0", fontSize: "14px", color: colors.TEXT_SECONDARY }}>
              {footerNote || "Thank you for your interest in my work!"}
            </Text>
            <Text style={{ margin: 0, fontSize: "12px", color: colors.TEXT_SECONDARY }}>
              © {new Date().getFullYear()} Yashdeep Tandon. All rights reserved.
            </Text>
            <Text style={{ margin: "10px 0 0 0", fontSize: "12px" }}>
              <Link href={SITE_URL} style={{ color: colors.TEXT_SECONDARY }}>
                Visit my portfolio
              </Link>
              {unsubscribeUrl && (
                <>
                  {" · "}
                  <Link
                    href={unsubscribeUrl}
                    style={{ color: colors.TEXT_SECONDARY, textDecoration: "underline" }}
                  >
                    Unsubscribe
                  </Link>
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EmailLayout;
