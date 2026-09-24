import { sendMail } from '../../../../common/mailer.server'
import { getAppBaseUrl, getPublicAssetPath } from './utils.server'
import { createPasswordResetToken } from '../shared/password.server'

export function buildPasswordResetLink(params: {
  userId: string
  email: string
}) {
  const token = createPasswordResetToken({
    userId: params.userId,
    email: params.email,
  })
  const url = new URL('/reset-password', getAppBaseUrl())
  url.searchParams.set('token', token)
  return url.toString()
}

function renderPasswordResetEmailHtml(link: string) {
  return `
    <div style="margin:0;padding:24px;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 auto;border-collapse:separate">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:760px;border-collapse:separate;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5edf8;box-shadow:0 12px 28px rgba(15,23,42,.06)">
              <tr>
                <td style="padding:36px 40px 24px" align="center">
                  <img src="cid:email-logo" alt="OZOSHIP" width="160" style="display:block;width:160px;height:auto;border:0;outline:none;text-decoration:none" />
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:0 36px 8px">
                  <div style="font-size:34px;line-height:1.18;font-weight:800;color:#0f2f7b;letter-spacing:-0.03em;text-align:center">
                    Đặt lại <span style="color:#ff9f1a">mật khẩu</span> của bạn
                  </div>
                  <div style="margin:16px auto 0;max-width:620px;font-size:16px;line-height:1.8;color:#5b6b8a;text-align:center">
                    Xin chào!
                    <br />
                    Chúng tôi không thể gửi lại mật khẩu cũ vì lý do bảo mật.
                    <br />
                    Hãy dùng nút bên dưới để tạo mật khẩu mới cho tài khoản của bạn.
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:26px 36px 0">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate">
                    <tr>
                      <td bgcolor="#2f6fed" style="border-radius:14px;background:#2f6fed;background-color:#2f6fed;">
                        <a href="${link}" style="display:inline-block;min-width:300px;max-width:100%;padding:16px 28px;border-radius:14px;background:#2f6fed;background-color:#2f6fed;color:#ffffff !important;text-decoration:none;font-size:17px;font-weight:700;text-align:center;box-shadow:0 10px 24px rgba(47,111,237,.26);">
                          Đặt lại mật khẩu
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:22px 36px 8px">
                  <div style="font-size:14px;line-height:1.7;color:#5b6b8a">
                    Hoặc sao chép và dán liên kết dưới đây vào trình duyệt:
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 36px 34px">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;background:#f7fbff;border:1px solid #cfe0ff;border-radius:14px">
                    <tr>
                      <td style="padding:18px 20px;font-size:14px;line-height:1.8;color:#1d4ed8;word-break:break-all">${link}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:0 36px 28px;font-size:12px;line-height:1.7;color:#94a3b8">
                  Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

export async function sendPasswordResetEmail(params: {
  email: string
  link: string
}) {
  await sendMail({
    to: params.email,
    subject: 'Đặt lại mật khẩu của bạn',
    text: [
      'Xin chào,',
      '',
      'Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.',
      'Để tiếp tục, vui lòng mở liên kết bên dưới và tạo mật khẩu mới:',
      params.link,
      '',
      'Nếu bạn không yêu cầu việc này, bạn có thể bỏ qua email này.',
    ].join('\n'),
    html: renderPasswordResetEmailHtml(params.link),
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
