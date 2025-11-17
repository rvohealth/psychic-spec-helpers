import { CalendarDate, DateTime, Dream } from '@rvoh/dream'
import { DreamAttributes } from '@rvoh/dream/types'

export type StringToInt<T extends string> = T extends `${infer N extends number}` ? N : never

export type DreamRequestAttributes<
  I extends Dream,
  Attrs extends DreamAttributes<I> = DreamAttributes<I>,
> = Partial<{
  [K in keyof Attrs]: Attrs[K] extends undefined | null
    ? Attrs[K]
    : Attrs[K] extends DateTime | CalendarDate | null
      ? string
      : Attrs[K] extends DateTime | CalendarDate
        ? string
        : Attrs[K] extends CalendarDate | null
          ? string
          : Attrs[K] extends CalendarDate
            ? string
            : Attrs[K]
}>
