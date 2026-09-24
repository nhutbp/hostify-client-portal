import { sendMail } from '../../../common/mailer.server'
import { getAppBaseUrl, getPublicAssetPath } from './utils.server'

export function buildVerificationLink(params: {
  userId: string
  createdAt: string
  email?: string
}) {
  const url = new URL('/verify-email/confirm', getAppBaseUrl())
  url.searchParams.set('userId', params.userId)
  url.searchParams.set('createdAt', params.createdAt)
  if (params.email) {
    url.searchParams.set('email', params.email)
  }
  return url.toString()
}

function renderVerificationEmailHtml(link: string) {
  return `
    <div style="margin:0;padding:24px;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 auto;border-collapse:separate">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:980px;border-collapse:separate">
              <tr>
                <td style="padding:0 0 24px">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5edf8;box-shadow:0 12px 28px rgba(15,23,42,.06)">
                    <tr>
                      <td style="padding:34px 44px 38px">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate">
                          <tr>
                            <td align="center" style="padding-bottom:20px">
                              <img src="cid:email-logo" alt="OZOSHIP" width="170" style="display:block;width:170px;height:auto;border:0;outline:none;text-decoration:none" />
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-top:6px">
                              <div style="font-size:40px;line-height:1.12;font-weight:800;color:#0f2f7b;letter-spacing:-0.04em;text-align:center">
                                Xác nhận <span style="color:#ff9f1a">email</span> của bạn
                              </div>
                              <div style="margin:18px auto 0;max-width:640px;font-size:18px;line-height:1.75;color:#5b6b8a;text-align:center">
                                Xin chào!
                                <br />
                                Cảm ơn bạn đã đăng ký tài khoản tại OZOSHIP.
                                <br />
                                Vui lòng xác nhận email của bạn để hoàn tất quá trình đăng ký.
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 28px">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;background:#ffffff;border:1px solid #e5edf8;border-radius:24px;box-shadow:0 20px 50px rgba(15,23,42,.06)">
                    <tr>
                      <td align="center" style="padding:0 28px 0">
                        <div style="margin-top:-28px;width:84px;height:84px;border-radius:999px;background:#eef4ff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(37,99,235,.12)">
                          <div style="width:54px;height:54px;border-radius:16px;background:#2f6fed;color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:1">✉</div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:18px 38px 8px">
                        <div style="font-size:30px;line-height:1.25;font-weight:800;color:#0f2f7b">Xác nhận địa chỉ email</div>
                        <div style="margin-top:14px;font-size:16px;line-height:1.8;color:#5b6b8a">
                          Để kích hoạt tài khoản và bắt đầu sử dụng dịch vụ,
                          <br />
                          vui lòng nhấn vào nút bên dưới để xác nhận địa chỉ email của bạn.
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:22px 38px 0">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate">
                          <tr>
                            <td bgcolor="#2f6fed" style="border-radius:14px;background:#2f6fed;background-color:#2f6fed;">
                              <a href="${link}" style="display:inline-block;min-width:320px;max-width:100%;padding:18px 28px;border-radius:14px;background:#2f6fed;background-color:#2f6fed;color:#ffffff !important;text-decoration:none;font-size:18px;font-weight:700;text-align:center;box-shadow:0 10px 24px rgba(47,111,237,.26);">
                                Xác nhận email của tôi
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:24px 38px 10px">
                        <div style="font-size:14px;line-height:1.7;color:#5b6b8a">
                          Hoặc sao chép và dán liên kết dưới đây vào trình duyệt:
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 38px 34px">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;background:#f7fbff;border:1px solid #cfe0ff;border-radius:14px">
                          <tr>
                            <td style="padding:18px 20px;font-size:14px;line-height:1.8;color:#1d4ed8;word-break:break-all">${link}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 20px">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;background:#ffffff;border:1px solid #e5edf8;border-radius:20px">
                    <tr>
                      <td style="padding:26px 28px">
                        <div style="font-size:16px;line-height:1.7;font-weight:700;color:#0f2f7b">
                          Vì sao cần xác nhận email?
                        </div>
                        <div style="margin-top:10px;font-size:15px;line-height:1.8;color:#5b6b8a">
                          Xác nhận email giúp bảo vệ tài khoản của bạn và đảm bảo bạn nhận được những thông báo quan trọng từ OZOSHIP.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 24px">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-top:1px solid #e5edf8;padding-top:20px">
                    <tr>
                      <td align="center" style="padding:0 10px 10px;font-size:13px;line-height:1.7;color:#64748b">
                        Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top:4px;font-size:12px;line-height:1.6;color:#94a3b8">
                        © 2026 OZOSHIP. All rights reserved.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

export async function sendVerificationLinkEmail(params: {
  email: string
  link: string
}) {
  await sendMail({
    to: params.email,
    subject: 'Xác thực email của bạn',
    text: [
      'Xin chào,',
      '',
      'Chúng tôi đã nhận được yêu cầu xác thực email cho tài khoản của bạn.',
      'Vui lòng mở liên kết bên dưới để hoàn tất xác thực:',
      params.link,
      '',
      'Nếu bạn không yêu cầu việc này, bạn có thể bỏ qua email này.',
    ].join('\n'),
    html: renderVerificationEmailHtml(params.link),
    attachments: [
      {
        filename: 'logo-company.png',
        path: getPublicAssetPath('/images/logo-company.png'),
        cid: 'email-logo',
        contentType: 'image/png',
      },
    ],
  })
}
