import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import { env } from './env.server'

type MailAddress = {
  name?: string
  address: string
}

type MailAttachment = {
  filename: string
  path?: string
  cid?: string
  contentType?: string
}

export type SendMailInput = {
  to: string | MailAddress | Array<string | MailAddress>
  subject: string
  text: string
  html?: string
  attachments?: MailAttachment[]
}

let transporterPromise: Promise<
  nodemailer.Transporter<SMTPTransport.SentMessageInfo>
> | null = null

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 10_000,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPassword,
        },
      }),
    )
  }

  return transporterPromise
}

export function getSmtpFromAddress() {
  return env.smtpFrom || env.smtpUser
}

export async function sendMail(input: SendMailInput) {
  const transporter = await getTransporter()
  const from = getSmtpFromAddress()

  return transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  })
}
