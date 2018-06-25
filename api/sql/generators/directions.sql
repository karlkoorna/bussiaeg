/*
SELECT time.stop_id, GROUP_CONCAT(terminus.area) FROM stop_times AS time
LEFT OUTER JOIN (
	SELECT trip_id, area FROM stop_times
    LEFT OUTER JOIN stops ON id = stop_id
    WHERE (trip_id, sequence) IN (
		SELECT trip_id, MAX(sequence) FROM stop_times GROUP BY trip_id
	)
) AS terminus ON terminus.trip_id = time.trip_id
GROUP BY stop_id
*/