import httpx
from typing import Dict, List, Optional
from datetime import datetime, date, timedelta
from config.settings import settings


class SamsungHealthService:
    """
    Samsung Health API Integration
    Note: This is a simplified implementation. Actual Samsung Health API requires
    proper OAuth2 flow and specific endpoints that may vary.
    """

    def __init__(self):
        self.client_id = settings.SAMSUNG_CLIENT_ID
        self.client_secret = settings.SAMSUNG_CLIENT_SECRET
        self.redirect_uri = settings.SAMSUNG_REDIRECT_URI
        self.base_url = "https://api.samsunghealth.com/v1"  # Example URL

    async def get_authorization_url(self, state: str) -> str:
        """
        Generate Samsung Health OAuth authorization URL
        """
        auth_url = (
            f"https://account.samsung.com/oauth2/authorize?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"state={state}&"
            f"scope=steps,exercise,heart_rate,sleep,weight"
        )
        return auth_url

    async def exchange_code_for_token(self, code: str) -> Dict:
        """
        Exchange authorization code for access token
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://account.samsung.com/oauth2/token",
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "redirect_uri": self.redirect_uri,
                    },
                )

                if response.status_code == 200:
                    token_data = response.json()
                    return {
                        "access_token": token_data.get("access_token"),
                        "refresh_token": token_data.get("refresh_token"),
                        "expires_in": token_data.get("expires_in"),
                        "token_type": token_data.get("token_type"),
                    }
                else:
                    return {"error": "Failed to exchange code for token"}

            except Exception as e:
                return {"error": str(e)}

    async def refresh_access_token(self, refresh_token: str) -> Dict:
        """
        Refresh access token using refresh token
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://account.samsung.com/oauth2/token",
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": refresh_token,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                    },
                )

                if response.status_code == 200:
                    token_data = response.json()
                    return {
                        "access_token": token_data.get("access_token"),
                        "refresh_token": token_data.get("refresh_token"),
                        "expires_in": token_data.get("expires_in"),
                    }
                else:
                    return {"error": "Failed to refresh token"}

            except Exception as e:
                return {"error": str(e)}

    async def get_daily_steps(
        self, access_token: str, target_date: Optional[date] = None
    ) -> Dict:
        """
        Get daily step count from Samsung Health
        """
        if not target_date:
            target_date = date.today()

        start_time = datetime.combine(target_date, datetime.min.time())
        end_time = datetime.combine(target_date, datetime.max.time())

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/steps",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={
                        "start_time": start_time.isoformat(),
                        "end_time": end_time.isoformat(),
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "date": target_date.isoformat(),
                        "steps": data.get("total_steps", 0),
                        "distance_meters": data.get("distance", 0),
                        "calories_burned": data.get("calories", 0),
                    }
                else:
                    return {"error": "Failed to fetch steps data"}

            except Exception as e:
                # Fallback to mock data for development
                return {
                    "date": target_date.isoformat(),
                    "steps": 0,
                    "distance_meters": 0,
                    "calories_burned": 0,
                    "error": "Samsung Health API not configured",
                }

    async def get_exercise_sessions(
        self, access_token: str, days: int = 7
    ) -> List[Dict]:
        """
        Get exercise sessions from Samsung Health
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/exercise",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={
                        "start_time": start_date.isoformat(),
                        "end_time": end_date.isoformat(),
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    exercises = []

                    for session in data.get("sessions", []):
                        exercises.append({
                            "exercise_type": session.get("exercise_type"),
                            "start_time": session.get("start_time"),
                            "end_time": session.get("end_time"),
                            "duration_minutes": session.get("duration", 0),
                            "calories_burned": session.get("calories", 0),
                            "distance_meters": session.get("distance", 0),
                            "heart_rate_avg": session.get("avg_heart_rate", 0),
                        })

                    return exercises
                else:
                    return []

            except Exception as e:
                return []

    async def get_heart_rate(
        self, access_token: str, target_date: Optional[date] = None
    ) -> Dict:
        """
        Get heart rate data
        """
        if not target_date:
            target_date = date.today()

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/heart_rate",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={"date": target_date.isoformat()},
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "date": target_date.isoformat(),
                        "resting_heart_rate": data.get("resting", 0),
                        "avg_heart_rate": data.get("average", 0),
                        "max_heart_rate": data.get("max", 0),
                        "min_heart_rate": data.get("min", 0),
                    }
                else:
                    return {"error": "Failed to fetch heart rate data"}

            except Exception as e:
                return {"error": str(e)}

    async def get_sleep_data(
        self, access_token: str, target_date: Optional[date] = None
    ) -> Dict:
        """
        Get sleep data
        """
        if not target_date:
            target_date = date.today()

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/sleep",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={"date": target_date.isoformat()},
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "date": target_date.isoformat(),
                        "total_sleep_hours": data.get("total_hours", 0),
                        "deep_sleep_hours": data.get("deep_sleep", 0),
                        "light_sleep_hours": data.get("light_sleep", 0),
                        "rem_sleep_hours": data.get("rem_sleep", 0),
                        "sleep_quality_score": data.get("quality_score", 0),
                    }
                else:
                    return {"error": "Failed to fetch sleep data"}

            except Exception as e:
                return {"error": str(e)}

    async def get_weight_history(
        self, access_token: str, days: int = 30
    ) -> List[Dict]:
        """
        Get weight history
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/weight",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={
                        "start_date": start_date.date().isoformat(),
                        "end_date": end_date.date().isoformat(),
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    weight_history = []

                    for entry in data.get("records", []):
                        weight_history.append({
                            "date": entry.get("date"),
                            "weight_kg": entry.get("weight"),
                            "body_fat_percentage": entry.get("body_fat", 0),
                        })

                    return weight_history
                else:
                    return []

            except Exception as e:
                return []

    async def sync_all_data(self, access_token: str) -> Dict:
        """
        Sync all available data from Samsung Health
        """
        try:
            steps_data = await self.get_daily_steps(access_token)
            exercises = await self.get_exercise_sessions(access_token, days=7)
            heart_rate = await self.get_heart_rate(access_token)
            sleep_data = await self.get_sleep_data(access_token)
            weight_history = await self.get_weight_history(access_token, days=30)

            return {
                "success": True,
                "synced_at": datetime.now().isoformat(),
                "data": {
                    "steps": steps_data,
                    "exercises": exercises,
                    "heart_rate": heart_rate,
                    "sleep": sleep_data,
                    "weight_history": weight_history,
                },
            }

        except Exception as e:
            return {"success": False, "error": str(e)}


# Singleton instance
samsung_health_service = SamsungHealthService()
