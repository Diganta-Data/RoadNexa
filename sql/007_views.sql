-- City-level summary view
CREATE OR REPLACE VIEW analytics.vw_city_summary AS
SELECT
    c.city_id,
    c.city_name,
    c.state,
    (SELECT COUNT(*) FROM core.dim_road r WHERE r.city_id = c.city_id) AS total_roads,
    (SELECT COUNT(*) FROM core.fact_accident a WHERE a.city_id = c.city_id) AS total_accidents,
    (SELECT COUNT(*) FROM core.fact_accident a WHERE a.city_id = c.city_id AND a.severity = 'fatal') AS fatal_accidents,
    (SELECT COUNT(*) FROM core.fact_pothole p WHERE p.city_id = c.city_id) AS total_potholes
FROM core.dim_city c
WHERE c.active = TRUE;

-- Roads ranked by accident count
CREATE OR REPLACE VIEW analytics.vw_dangerous_roads AS
SELECT
    r.city_id,
    r.road_id,
    r.road_name,
    COUNT(a.accident_id) AS accident_count,
    SUM(CASE WHEN a.severity = 'fatal' THEN 1 ELSE 0 END) AS fatal_count
FROM core.dim_road r
LEFT JOIN core.fact_accident a ON r.road_id = a.road_id
GROUP BY r.city_id, r.road_id, r.road_name
HAVING COUNT(a.accident_id) > 0
ORDER BY accident_count DESC;
