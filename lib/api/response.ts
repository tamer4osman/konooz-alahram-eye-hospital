import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiError(status: number, code: string, messageAr: string, messageEn: string) {
  return NextResponse.json({ error: { code, messageAr, messageEn } }, { status })
}
