import React from 'react';

export default function IconStop({ type, width, id, className, map }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id={id} className={className} fill="#fff" width={map ? 26 : undefined}>
		{{
			bus: (
				<g>
					<path fill="#00e1b4" d="M640 1024.5H384c-211.2 0-384-172.8-384-384v-256C0 173.3 172.8.5 384 .5h256c211.2 0 384 172.8 384 384v256c0 211.2-172.8 384-384 384z" />
					<path d="M776.2 284.2c-2.9-29-3.3-77.9-18-94.5-14.7-16.6-198-19.3-246.2-19.3s-231.5 2.7-246.2 19.3c-14.7 16.6-15.1 65.5-18 94.5-2.9 29-3.9 216.7-2.7 246.4s3.4 129.4 6.8 156.1 5.5 70.6 13.8 78.1 49.5 12.1 71.9 12.9c22.4.9 103.2 5.7 174.4 5.7s152-4.9 174.4-5.7c22.4-.9 63.6-5.4 71.9-12.9 8.3-7.5 10.4-51.3 13.8-78.1 3.4-26.7 5.5-126.4 6.8-156.1s.2-217.4-2.7-246.4zM368.7 722.1c-27.2 0-49.2-22-49.2-49.2s22-49.2 49.2-49.2 49.2 22 49.2 49.2-22 49.2-49.2 49.2zm286.6 0c-27.2 0-49.2-22-49.2-49.2s22-49.2 49.2-49.2c27.2 0 49.2 22 49.2 49.2s-22.1 49.2-49.2 49.2zm70.9-161.9C716 575 644.4 589 512 589s-204-14-214.2-28.8c-10.2-14.8-5.1-107.7 4.2-160.8s51.8-158.7 210-158.7 200.7 105.6 210 158.7c9.3 53 14.4 145.9 4.2 160.8z" />
					<path d="M319.8 764.8c0 36.8-15.6 88.8 44.7 88.8s50.3-48.6 50.3-85.4m289.4-3.4c0 36.8 15.6 88.8-44.7 88.8-60.2 0-50.3-48.6-50.3-85.4" />
				</g>
			),
			trol: (
				<g>
					<path fill="#3682ce" d="M640 1024.5H384c-211.2 0-384-172.8-384-384v-256C0 173.3 172.8.5 384 .5h256c211.2 0 384 172.8 384 384v256c0 211.2-172.8 384-384 384z" />
					<path d="M338.3 766.1c0 33.2-14.1 80.2 40.4 80.2s45.5-44 45.5-77.2m261.4-3c0 33.2 14.1 80.2-40.4 80.2-54.4 0-45.5-44-45.5-77.2M460.2 230S398.5 123.1 392 119.2c-6.5-3.8-46.2-6.7-48.5 2.5-2.3 9.2 40.4 70 70.7 111.9m158.3-3.6s61.7-106.9 68.2-110.8c6.5-3.8 46.2-6.7 48.5 2.5 2.3 9.2-40.4 70-70.7 111.9" />
					<path d="M750.7 331.9c-2.6-26.2-3-70.4-16.3-85.4S555.5 229.1 512 229.1s-209.2 2.4-222.4 17.4c-13.3 15-13.6 59.2-16.3 85.4-2.6 26.2-3.5 195.8-2.4 222.6s3.1 116.9 6.1 141.1 5 63.8 12.5 70.5c7.5 6.8 44.7 10.9 65 11.7S447.8 783 512 783s137.3-4.4 157.5-5.2 57.5-4.9 65-11.7c7.5-6.8 9.4-46.4 12.5-70.5s5-114.2 6.1-141.1c1.1-26.8.2-196.4-2.4-222.6zM382.5 727.6c-24.6 0-44.5-19.9-44.5-44.5s19.9-44.5 44.5-44.5 44.5 19.9 44.5 44.5-19.9 44.5-44.5 44.5zm258.9 0c-24.6 0-44.5-19.9-44.5-44.5s19.9-44.5 44.5-44.5 44.5 19.9 44.5 44.5-19.9 44.5-44.5 44.5zm64.1-146.4c-9.2 13.4-74 26.1-193.6 26.1s-184.4-12.6-193.6-26.1c-9.2-13.4-4.6-97.4 3.8-145.3C330.7 388 369 292.6 512 292.6S693.3 388 701.7 435.9c8.4 48 13 131.9 3.8 145.3z" />
				</g>
			),
			tram: (
				<g>
					<path fill="#fb7625" d="M640 1024.5H384c-211.2 0-384-172.8-384-384v-256C0 173.3 172.8.5 384 .5h256c211.2 0 384 172.8 384 384v256c0 211.2-172.8 384-384 384z" />
					<path d="M759.7 488.8c-2.1-82.5-19-171-45-230.2-26-59.2-125.1-50.1-202.8-50.1s-176.8-9.1-202.8 50.1-42.9 147.8-45 230.2c-2.1 82.5-19.7 241.4 14.3 257.3 33.9 15.8 184.4 18.4 233.5 18.4s199.5-2.6 233.5-18.4c34-15.9 16.4-174.9 14.3-257.3zM415.3 725.3c-26 0-47-21.1-47-47 0-26 21.1-47 47-47s47 21.1 47 47-21 47-47 47zm193.3 0c-26 0-47-21.1-47-47 0-26 21.1-47 47-47 26 0 47 21.1 47 47 .1 25.9-21 47-47 47zm108.2-147.2c-9.7 14.2-78.3 27.6-204.8 27.6s-195.1-13.4-204.8-27.6c-9.7-14.2-4.9-103 4.1-153.7 8.9-50.7 49.5-151.7 200.8-151.7s191.8 101 200.8 151.7c8.7 50.7 13.6 139.5 3.9 153.7z" />
					<path d="M613.5 762.5H410.4s-86 73.3-86 86.8 18.1 31.9 26.5 30.8 28.9-36 37.9-38.9c8.9-3 123.1-3.8 123.1-3.8h.1s114.2.8 123.1 3.8c8.9 3 29.5 37.9 37.9 38.9 8.4 1.1 26.5-17.3 26.5-30.8s-86-86.8-86-86.8zm-25.9 33c-2.6 6.1-75.6 3.9-75.6 3.9h-.1s-72.9 2.2-75.6-3.9c-2.6-6.1 33.3-31.8 33.3-31.8h84.8c-.1 0 35.8 25.7 33.2 31.8zM512 147s-98.8.4-104.4 9.5 44.4 58.8 44.4 58.8-7.3 28.4-31 7.7-72-81.3-68.9-89.8c3-8.5 88.8-15.2 160-15.2s157 6.7 160 15.2-45.2 69.1-68.9 89.8-31-7.7-31-7.7 50.1-49.7 44.4-58.8C610.7 147.4 512 147 512 147z" />
				</g>
			),
			train: (
				<g>
					<path fill="#f48b1e" d="M640 1024.5H384c-211.2 0-384-172.8-384-384v-256C0 173.3 172.8.5 384 .5h256c211.2 0 384 172.8 384 384v256c0 211.2-172.8 384-384 384z" />
					<path d="M765.4 386.2c-.3-106.9-8.7-187.6-19.3-200.8-10.6-13.2-101-18.4-234.1-18.4s-223.5 5.1-234.1 18.3c-10.6 13.2-19 94-19.3 200.8-.3 106.9 3.5 327.7 20 343.4S450 748 512 748s217.1-2.6 233.5-18.3 20.3-236.6 19.9-343.5zM376.6 691.1c-26.8 0-48.6-21.8-48.6-48.6s21.8-48.6 48.6-48.6 48.6 21.8 48.6 48.6c0 26.9-21.8 48.6-48.6 48.6zm270.8 0c-26.8 0-48.6-21.8-48.6-48.6s21.8-48.6 48.6-48.6 48.6 21.8 48.6 48.6c0 26.9-21.7 48.6-48.6 48.6zm44.7-308c-8.6 70.7-15.3 154-34.6 165.5s-83.8 17.9-145.6 17.9-126.3-6.4-145.6-17.9c-19.3-11.5-26-94.8-34.6-165.5-8.6-70.7-14.3-126.9-1.3-139.8 13-13 86.5-6.7 181.4-6.7s168.5-6.3 181.4 6.7c13.2 12.9 7.5 69.1-1.1 139.8z" />
  					<path d="M612.6 740.4H411.4s-85.2 72.6-85.2 86 17.9 31.6 26.2 30.5c8.3-1.1 28.7-35.6 37.5-38.6 8.8-2.9 121.9-3.8 121.9-3.8h.1s113.1.8 121.9 3.8c8.8 2.9 29.2 37.5 37.5 38.6 8.3 1.1 26.2-17.1 26.2-30.5s-84.9-86-84.9-86zm-25.7 32.7c-2.6 6-74.9 3.8-74.9 3.8h-.1s-72.3 2.2-74.9-3.8c-2.6-6 32.9-31.5 32.9-31.5h84c.1 0 35.6 25.5 33 31.5z" />
				</g>
			),
			coach: (
				<g>
					<path fill="#b552ba" d="M640 1024.5H384c-211.2 0-384-172.8-384-384v-256C0 173.3 172.8.5 384 .5h256c211.2 0 384 172.8 384 384v256c0 211.2-172.8 384-384 384z" />
					<path d="M776.2 284.2c-2.9-29-3.3-77.9-18-94.5-14.7-16.6-198-19.3-246.2-19.3s-231.5 2.7-246.2 19.3c-14.7 16.6-15.1 65.5-18 94.5-2.9 29-3.9 216.7-2.7 246.4s3.4 129.4 6.8 156.1 5.5 70.6 13.8 78.1 49.5 12.1 71.9 12.9c22.4.9 103.2 5.7 174.4 5.7s152-4.9 174.4-5.7c22.4-.9 63.6-5.4 71.9-12.9 8.3-7.5 10.4-51.3 13.8-78.1 3.4-26.7 5.5-126.4 6.8-156.1s.2-217.4-2.7-246.4zM368.7 722.1c-27.2 0-49.2-22-49.2-49.2s22-49.2 49.2-49.2 49.2 22 49.2 49.2-22 49.2-49.2 49.2zm286.6 0c-27.2 0-49.2-22-49.2-49.2s22-49.2 49.2-49.2c27.2 0 49.2 22 49.2 49.2s-22.1 49.2-49.2 49.2zm70.9-161.9C716 575 644.4 589 512 589s-204-14-214.2-28.8c-10.2-14.8-5.1-107.7 4.2-160.8s51.8-158.7 210-158.7 200.7 105.6 210 158.7c9.3 53 14.4 145.9 4.2 160.8z" />
					<path d="M319.8 764.8c0 36.8-15.6 88.8 44.7 88.8s50.3-48.6 50.3-85.4m289.4-3.4c0 36.8 15.6 88.8-44.7 88.8-60.2 0-50.3-48.6-50.3-85.4" />
				</g>
			)
		}[type]}
		</svg>
	);
}