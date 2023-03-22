import {
  REMARK_CONTENT_VERSION_ACTION_MAP,
  RemarkContentProps,
  SocialRemarkMessage,
  SocialRemarkMessageAction,
  SocialRemarkMessageProtocolName,
  SocialRemarkMessageVersion,
  SubSclSource,
} from './types'
import { SocialRemarkConfig, SocialRemarkConfigData } from './config'
import { decorateRemarkContentValue } from './decorators'

export class SocialRemark {

  static setConfig(data: SocialRemarkConfigData) {
    SocialRemarkConfig.getInstance().setConfig(data)
  }

  private msgParsed: SocialRemarkMessage<SocialRemarkMessageAction, boolean> | null = null

  private protNames: Set<SocialRemarkMessageProtocolName> = new Set(
    SocialRemarkConfig.getInstance().config.protNames,
  )

  private versions: Set<SocialRemarkMessageVersion> = new Set(
    SocialRemarkConfig.getInstance().config.versions,
  )

  private actions: Set<SocialRemarkMessageAction> = new Set(
    SocialRemarkConfig.getInstance().config.actions,
  )

  private msgDelimiter = '::'

  public get message(): SocialRemarkMessage<SocialRemarkMessageAction, boolean> | never {
    if (!this.msgParsed) throw new Error('Message is not available.')
    return this.msgParsed!
  }

  public get content() {
    return this.msgParsed && this.msgParsed.valid ? this.msgParsed.content : null
  }

  public get version() {
    return this.msgParsed ? this.msgParsed.version : null
  }

  public get isValidMessage(): boolean {
    return !!this.msgParsed && this.msgParsed.valid
  }

  static bytesToString(src: unknown): string {
    if (!src || !Buffer.isBuffer(src)) return ''
    return Buffer.from(src).toString('utf-8')
  }

  public fromMessage(_maybeRemarkMsg: unknown): SocialRemark {
    return this
  }

  public fromSource(rmrkSrc: SubSclSource<SocialRemarkMessageAction>): SocialRemark {
    let isSrcValid = true

    if (
      !rmrkSrc ||
      !this.isValidProtName(rmrkSrc.protName) ||
      !this.isValidVersion(rmrkSrc.version) ||
      !this.isValidAction(rmrkSrc.action)
    )
      isSrcValid = false

    // TODO add content validation

    if (!isSrcValid) throw new Error('Remark source is invalid')

    try {
      this.msgParsed = {
        ...rmrkSrc,
        valid: true,
      }
      const contentPropsMap = REMARK_CONTENT_VERSION_ACTION_MAP[rmrkSrc.version as any][rmrkSrc.action]
      for (const contentPropName in contentPropsMap) {
        (this.msgParsed.content as any)[contentPropName] = decorateRemarkContentValue(
          this.msgParsed.action,
          contentPropName as RemarkContentProps,
          (rmrkSrc.content as any)[contentPropName],
        )
      }
    } catch (e) {
      console.log(e)
      throw new Error('Error has been occurred during remark message creation.')
    }
    return this
  }

  public toMessage(): string {
    if (!this.isValidMessage) throw new Error('Remark is not valid for build message.')

    const msg: string[] = []
    msg.push(this.message.protName)
    msg.push(this.message.version)
    msg.push(this.message.action)

    try {
      const contentPropsMap =
        REMARK_CONTENT_VERSION_ACTION_MAP[this.message.version][this.message.action]
      for (const contentPropName in contentPropsMap) {
        msg[contentPropsMap[contentPropName]] = decorateRemarkContentValue(
          this.message.action,
          contentPropName as RemarkContentProps,
          (this.message.content as any)[contentPropName],
        )
      }
    } catch (e) {
      console.log(e)
      throw new Error('Error has been occurred during remark message creation.')
    }

    //TODO add validations
    return msg.join(this.msgDelimiter)
  }

  private isValidProtName(src: string): boolean {
    // TODO remove type casting
    return !!(src && this.protNames.has(src as SocialRemarkMessageProtocolName))
  }
  private isValidVersion(src: string): boolean {
    // TODO remove type casting
    return !!(src && this.versions.has(src as SocialRemarkMessageVersion))
  }
  private isValidAction(src: string): boolean {
    // TODO remove type casting
    return !!(src && this.actions.has(src as SocialRemarkMessageAction))
  }
}
