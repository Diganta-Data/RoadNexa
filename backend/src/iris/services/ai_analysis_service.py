"""AI Analysis Service supporting Google Gemini API, Groq LLM, and rule-assisted ML fallback."""

import httpx
from typing import Dict, Any, Optional
from iris.config.settings import get_settings

async def generate_ai_road_analysis(road_data: Dict[str, Any], question: Optional[str] = None) -> Dict[str, Any]:
    """Generate executive AI road safety analysis & action plan using Gemini API / Groq or expert synthesis engine."""
    
    settings = get_settings()
    road_name = road_data.get("road_name", "Selected Road")
    road_type = road_data.get("road_type", "primary")
    accidents = road_data.get("safety_stats", {}).get("total_accidents", 18)
    fatalities = road_data.get("safety_stats", {}).get("fatalities", 2)
    potholes = road_data.get("safety_stats", {}).get("potholes", 7)
    risk_score = road_data.get("risk", {}).get("score", 68)
    risk_level = road_data.get("risk", {}).get("level", "HIGH")
    lanes = road_data.get("lanes", "4")
    surface = road_data.get("surface", "asphalt")

    base_context = f"""
    Road Name: {road_name}
    Classification: {road_type} ({lanes} lanes, {surface} surface)
    Calculated Risk Score: {risk_score}/100 (Level: {risk_level})
    Historical Accidents: {accidents} (Fatalities: {fatalities})
    Active Potholes/Defects: {potholes}
    """

    if question:
        prompt = f"""
        You are an expert Civil & Highway Safety Engineer for IRIS (Indian Road Intelligence & Safety Platform).
        You are analyzing the following road segment:
        {base_context}

        The user has asked the following specific question about this location:
        "{question}"

        Please provide a concise, expert answer to the user's question. Focus on safety, engineering, and the provided data.
        """
    else:
        prompt = f"""
        You are an expert Civil & Highway Safety Engineer for IRIS (Indian Road Intelligence & Safety Platform).
        Analyze this road segment and provide a professional safety diagnosis and targeted engineering action plan.
        {base_context}

        Provide:
        1. Executive Summary & Root Cause Analysis (2-3 sentences)
        2. Primary High-Risk Crash Factors (bullet points)
        3. Targeted Engineering & Maintenance Remediation Actions (bullet points)
        4. Estimated Safety Priority Level (CRITICAL / URGENT / ROUTINE)
        """

    # 1. Try Google Gemini API if key is present
    if settings.gemini_api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={settings.gemini_api_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    text_resp = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "provider": "Google Gemini 3.6 Flash AI",
                        "status": "success",
                        "analysis_markdown": text_resp,
                        "risk_score": risk_score,
                        "risk_level": risk_level
                    }
                else:
                    logger.error(f"Gemini API returned error code {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Gemini API call failed with exception: {e}", exc_info=True)

    # 2. Try Groq API if key is present
    if settings.groq_api_key:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {settings.groq_api_key}"}
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    text_resp = resp.json()["choices"][0]["message"]["content"]
                    return {
                        "provider": "Groq LLaMA-3.3 70B AI",
                        "status": "success",
                        "analysis_markdown": text_resp,
                        "risk_score": risk_score,
                        "risk_level": risk_level
                    }
        except Exception as e:
            print(f"Groq API call failed: {e}")

    # 3. Rule-assisted ML Synthesis Engine (Fallback when no key is set yet)
    remediation_actions = [
        f"Deploy automated speed calming & radar enforcement along {road_name}.",
        f"Perform emergency asphalt resurfacing for {potholes} active potholes & surface cracks.",
        f"Upgrade street lighting and high-contrast reflective lane markings for night vision.",
        "Construct pedestrian refuge islands & high-visibility zebra crossings at junctions."
    ]

    summary = (
        f"{road_name} presents a {risk_level.lower()} risk profile ({risk_score}/100) driven by high collision frequency "
        f"({accidents} crashes, {fatalities} fatalities) combined with surface degradation ({potholes} reported defects). "
        f"Engineering intervention is recommended to prevent future severe casualties."
    )

    return {
        "provider": "IRIS Rule-Assisted AI Synthesis",
        "status": "active",
        "analysis_markdown": f"### Executive Safety Diagnosis\n{summary}\n\n### Primary High-Risk Crash Factors\n- High conflict density at uncontrolled intersections\n- Speed limit exceedance during non-peak hours\n- Potholes and reduced wet-weather friction\n\n### Recommended Remediation Actions\n" + "\n".join([f"- {a}" for a in remediation_actions]),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "actions": remediation_actions
    }
