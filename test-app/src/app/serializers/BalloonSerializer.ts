import { DreamSerializer } from '@rvoh/dream'
import Balloon from '../models/Balloon.js'

export const BalloonSummarySerializer = (balloon: Balloon) =>
  DreamSerializer(Balloon, balloon).attribute('id')

export const BalloonSerializer = (balloon: Balloon) =>
  BalloonSummarySerializer(balloon).attribute('color')
