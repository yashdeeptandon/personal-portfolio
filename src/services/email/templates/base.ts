/**
 * Base Email Template
 * 
 * Provides the base HTML structure and styling for all email templates.
 * This ensures consistent branding and responsive design across all emails.
 */

import { BRAND_COLORS } from '../config';

export interface BaseTemplateData {
  title: string;
  preheader?: string;
  content: string;
  footerContent?: string;
  unsubscribeUrl?: string;
  trackingPixelUrl?: string;
}

/**
 * Generate base email HTML template
 */
export function generateBaseTemplate(data: BaseTemplateData): string {
  const {
    title,
    preheader = '',
    content,
    footerContent = '',
    unsubscribeUrl,
    trackingPixelUrl
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* Base styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: ${BRAND_COLORS.BACKGROUND};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: ${BRAND_COLORS.TEXT_PRIMARY};
        }

        /* Container styles */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${BRAND_COLORS.WHITE};
        }

        .email-header {
            background: linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.SECONDARY} 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .email-header h1 {
            margin: 0;
            color: ${BRAND_COLORS.WHITE};
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        .email-body {
            padding: 40px 30px;
        }

        .email-footer {
            background-color: ${BRAND_COLORS.BACKGROUND};
            padding: 30px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }

        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            margin: 0 0 20px 0;
            font-weight: 600;
            line-height: 1.3;
        }

        h2 {
            font-size: 24px;
            color: ${BRAND_COLORS.TEXT_PRIMARY};
        }

        h3 {
            font-size: 20px;
            color: ${BRAND_COLORS.TEXT_PRIMARY};
        }

        p {
            margin: 0 0 20px 0;
            color: ${BRAND_COLORS.TEXT_SECONDARY};
        }

        /* Button styles */
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background-color: ${BRAND_COLORS.PRIMARY};
            color: ${BRAND_COLORS.WHITE} !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: background-color 0.3s ease;
        }

        .btn:hover {
            background-color: ${BRAND_COLORS.SECONDARY};
        }

        .btn-secondary {
            background-color: transparent;
            color: ${BRAND_COLORS.PRIMARY} !important;
            border: 2px solid ${BRAND_COLORS.PRIMARY};
        }

        .btn-secondary:hover {
            background-color: ${BRAND_COLORS.PRIMARY};
            color: ${BRAND_COLORS.WHITE} !important;
        }

        /* Card styles */
        .card {
            background-color: ${BRAND_COLORS.WHITE};
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }

        .card-highlight {
            background-color: ${BRAND_COLORS.BACKGROUND};
            border-left: 4px solid ${BRAND_COLORS.PRIMARY};
        }

        /* Utility classes */
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .mb-0 { margin-bottom: 0 !important; }
        .mb-10 { margin-bottom: 10px !important; }
        .mb-20 { margin-bottom: 20px !important; }
        .mt-0 { margin-top: 0 !important; }
        .mt-10 { margin-top: 10px !important; }
        .mt-20 { margin-top: 20px !important; }

        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            
            .email-header,
            .email-body,
            .email-footer {
                padding: 20px !important;
            }
            
            .email-header h1 {
                font-size: 24px !important;
            }
            
            h2 {
                font-size: 20px !important;
            }
            
            .btn {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: #1F2937 !important;
            }
            
            .email-body {
                background-color: #1F2937 !important;
            }
            
            h2, h3 {
                color: #F9FAFB !important;
            }
            
            p {
                color: #D1D5DB !important;
            }
            
            .card {
                background-color: #374151 !important;
                border-color: #4B5563 !important;
            }
        }
    </style>
</head>
<body>
    ${preheader ? `
    <!-- Preheader text -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheader}
    </div>
    ` : ''}

    <!-- Email container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <div class="email-container">
                    <!-- Header -->
                    <div class="email-header">
                        <h1>Yashdeep Tandon</h1>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        ${content}
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: ${BRAND_COLORS.TEXT_SECONDARY};">
                            ${footerContent || 'Thank you for your interest in my work!'}
                        </p>
                        
                        <p style="margin: 0; font-size: 12px; color: ${BRAND_COLORS.TEXT_SECONDARY};">
                            © ${new Date().getFullYear()} Yashdeep Tandon. All rights reserved.
                        </p>
                        
                        ${unsubscribeUrl ? `
                        <p style="margin: 10px 0 0 0; font-size: 12px;">
                            <a href="${unsubscribeUrl}" style="color: ${BRAND_COLORS.TEXT_SECONDARY}; text-decoration: underline;">
                                Unsubscribe from these emails
                            </a>
                        </p>
                        ` : ''}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    ${trackingPixelUrl ? `
    <!-- Tracking pixel -->
    <img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" alt="">
    ` : ''}
</body>
</html>`;
}

/**
 * Generate plain text version of email
 */
export function generateBaseTextTemplate(data: {
  title: string;
  content: string;
  footerContent?: string;
  unsubscribeUrl?: string;
}): string {
  const { title, content, footerContent, unsubscribeUrl } = data;

  return `
${title}
${'='.repeat(title.length)}

${content}

---

${footerContent || 'Thank you for your interest in my work!'}

© ${new Date().getFullYear()} Yashdeep Tandon. All rights reserved.

${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}` : ''}
`.trim();
}
