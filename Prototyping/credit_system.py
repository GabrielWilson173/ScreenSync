from dataclasses import dataclass

from Database import Database_Access as db
from utils import time_utils


@dataclass(frozen=True)
class CreditUpdate:
    consumed: float
    earned: float
    time_to_award: int


def getCredits(uuid: str) -> float:
    # Process any earned credits that are ready to be awarded before returning the current credits
    processEarnedCredits(uuid)
    return db.getCredits(uuid)


def addCredits(uuid: str, credits: float) -> None:
    db.updateCredits(uuid, credits)


def updateCredits(uuid: str, app_name: str, screentime_seconds: float) -> CreditUpdate:
    credit_update = _calculateCreditUpdate(uuid, app_name, screentime_seconds)
    db.updateCredits(uuid, -credit_update.consumed)
    db.addEarnedCredits(uuid, credit_update.earned, credit_update.time_to_award)
    return credit_update


def processEarnedCredits(uuid: str) -> float:
    until_time = time_utils.unix_time()
    earned_credits = db.getEarnedCredits(uuid, until_time)
    db.deleteEarnedCredits(uuid, until_time)
    if earned_credits != 0.0:
        db.updateCredits(uuid, earned_credits)
    return earned_credits


def _calculateCreditUpdate(uuid: str, app_name: str, screentime_seconds: float) -> CreditUpdate:
    rate = db.getCreditsRate(uuid, app_name)

    if rate:
        cost_rate = rate["cost_rate"]
        earn_rate = rate["earn_rate"]
        earn_delay = rate["earn_delay"]

        consumed = (screentime_seconds / 3600) * cost_rate
        earned = (screentime_seconds / 3600) * earn_rate
        time_to_award = time_utils.unix_time() + earn_delay

        return CreditUpdate(consumed=consumed, earned=earned, time_to_award=time_to_award)
    else:
        raise Exception("No credit rates set for that user and app")
