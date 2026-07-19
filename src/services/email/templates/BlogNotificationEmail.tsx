/**
 * Notification email sent to newsletter subscribers when a new blog post is published.
 */

import * as React from "react";
import { Heading, Text, Link, Button, Row, Column, Section } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { formatEmailDate, generateUnsubscribeUrl } from "../config";
import { BlogNotificationParams } from "../types";
import { h2Style, h3Style, pStyle, cardHighlightStyle, cardStyle, btnStyle, btnSecondaryStyle, tagStyle, signatureStyle, colors } from "./styles";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type BlogNotificationEmailProps = BlogNotificationParams;

export function BlogNotificationEmail({
  blogPost,
  subscriber,
  unsubscribeUrl,
}: BlogNotificationEmailProps) {
  const displayName = subscriber?.name || "there";
  const finalUnsubscribeUrl =
    unsubscribeUrl || (subscriber?.subscriberId ? generateUnsubscribeUrl(subscriber.subscriberId) : undefined);
  const blogUrl = `${SITE_URL}/blog/${blogPost.slug}`;

  return (
    <EmailLayout
      title="New Blog Post Published"
      preheader={`${blogPost.title} - ${blogPost.excerpt.slice(0, 100)}`}
      footerNote="Happy reading!"
      unsubscribeUrl={finalUnsubscribeUrl}
    >
      <Heading as="h2" style={h2Style}>
        New Blog Post Published! 📝
      </Heading>

      <Text style={pStyle}>Hi {displayName},</Text>

      <Text style={pStyle}>
        I just published a new blog post that I think you&apos;ll find interesting. Here&apos;s
        what it&apos;s about:
      </Text>

      <Section style={cardHighlightStyle}>
        <Heading as="h3" style={h3Style}>
          <Link href={blogUrl} style={{ color: colors.TEXT_PRIMARY, textDecoration: "none" }}>
            {blogPost.title}
          </Link>
        </Heading>

        <Text style={{ ...pStyle, marginBottom: "16px" }}>{blogPost.excerpt}</Text>

        {blogPost.tags && blogPost.tags.length > 0 && (
          <Text style={{ marginBottom: "16px" }}>
            {blogPost.tags.map((tag) => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </Text>
        )}

        <Text style={{ fontSize: "14px", color: colors.TEXT_SECONDARY, marginBottom: "20px" }}>
          By {blogPost.author} • {formatEmailDate(blogPost.publishedAt)}
          {blogPost.readTime ? ` • ${blogPost.readTime} min read` : ""}
        </Text>

        <Row style={{ textAlign: "center" }}>
          <Column>
            <Button href={blogUrl} style={btnStyle}>
              Read Full Article
            </Button>
          </Column>
        </Row>
      </Section>

      <Section style={cardStyle}>
        <Heading as="h3" style={h3Style}>
          More from the blog
        </Heading>
        <Text style={pStyle}>
          If you enjoyed this post, you might also like to explore my other recent articles and
          tutorials.
        </Text>
        <Row style={{ textAlign: "center" }}>
          <Column>
            <Button href={`${SITE_URL}/blog`} style={btnSecondaryStyle}>
              Browse All Posts
            </Button>
          </Column>
        </Row>
      </Section>

      <Text style={{ marginTop: "30px", fontSize: "14px", color: colors.TEXT_SECONDARY }}>
        I hope you find this content valuable! Feel free to reply to this email if you have any
        questions or feedback.
      </Text>

      <Text style={signatureStyle}>
        Happy reading,
        <br />
        <strong style={{ color: colors.TEXT_PRIMARY }}>Yashdeep</strong>
      </Text>
    </EmailLayout>
  );
}

export default BlogNotificationEmail;
