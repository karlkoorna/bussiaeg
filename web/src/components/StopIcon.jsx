import React, { Fragment } from 'react';

import { colors } from './VehicleIcon.jsx';

export default function StopIcon({ id, className, type, size }) {
	
	const primaryColor = colors[type][0];
	
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id={id} className={className} width={size} height={size} fill="white">
			<path fill={primaryColor} d="M640 1024.5H384c-211.2 0-384-172.8-384-384v-256C0 173.3 172.8.5 384 .5h256c211.2 0 384 172.8 384 384v256c0 211.2-172.8 384-384 384z" />
			{{
				bus: (
					<Fragment>
						<path d="M313.4 773.2c0 38-16.1 91.7 46.2 91.7s52-50.2 52-88.2m299-3.5c0 38 16.1 91.7-46.2 91.7-62.2 0-52-50.2-52-88.2" />
						<path d="M784.9 276.7c-3-30-3.4-80.5-18.6-97.6s-204.5-20-254.3-20-239.2 2.8-254.3 19.9c-15.2 17.1-15.6 67.7-18.6 97.6s-4 223.9-2.8 254.5c1.2 30.7 3.5 133.7 7 161.3 3.5 27.6 5.7 72.9 14.3 80.7 8.6 7.7 51.1 12.5 74.3 13.3 23.1.9 106.6 5.9 180.2 5.9s157-5.1 180.2-5.9c23.1-.9 65.7-5.6 74.3-13.3 8.6-7.7 10.7-53 14.3-80.7 3.5-27.6 5.7-130.6 7-161.3 1.2-30.6 0-224.5-3-254.4zM364 729c-28.1 0-50.8-22.7-50.8-50.8s22.7-50.8 50.8-50.8c28.1 0 50.8 22.7 50.8 50.8S392.1 729 364 729zm296 0c-28.1 0-50.8-22.7-50.8-50.8s22.7-50.8 50.8-50.8 50.8 22.7 50.8 50.8S688 729 660 729zm73.3-167.2c-10.5 15.3-84.5 29.8-221.3 29.8s-210.7-14.5-221.3-29.8c-10.5-15.3-5.3-111.3 4.3-166.1s53.6-164 217-164 207.3 109.1 216.9 163.9c9.6 54.8 14.9 150.8 4.4 166.2z" />
					</Fragment>
				),
				trol: (
					<Fragment>
						<path d="M322.7 811.7c0 36.1-15.3 87.2 43.9 87.2s49.5-47.9 49.5-84m284.4-3.2c0 36.1 15.3 87.2-43.9 87.2s-49.5-47.9-49.5-84M455.3 228.5S388.2 112.2 381.1 108c-7.1-4.1-50.3-7.3-52.8 2.7s43.9 76.1 76.9 121.7m172.3-3.9s67.1-116.3 74.2-120.5c7.1-4.1 50.3-7.3 52.8 2.7s-43.9 76.1-76.9 121.7" />
						<path d="M771.3 339.4c-2.8-28.5-3.3-76.6-17.7-92.9-14.5-16.3-194.6-18.9-241.9-18.9s-227.6 2.6-241.9 18.9c-14.5 16.3-14.8 64.4-17.7 92.9-2.8 28.5-3.8 213-2.6 242.2 1.2 29.2 3.4 127.2 6.6 153.5 3.3 26.3 5.4 69.4 13.6 76.7 8.2 7.4 48.6 11.9 70.7 12.7 22.1.9 101.5 5.7 171.3 5.7s149.4-4.8 171.3-5.7c22-.9 62.6-5.3 70.7-12.7 8.2-7.4 10.2-50.5 13.6-76.7s5.4-124.2 6.6-153.5c1.2-29.2.3-213.7-2.6-242.2zM370.8 769.8c-26.8 0-48.4-21.6-48.4-48.4S344 673 370.8 673s48.4 21.6 48.4 48.4-21.7 48.4-48.4 48.4zm281.6 0c-26.8 0-48.4-21.6-48.4-48.4s21.6-48.4 48.4-48.4 48.4 21.6 48.4 48.4-21.6 48.4-48.4 48.4zm69.8-159.2c-10 14.6-80.5 28.4-210.6 28.4S311 625.3 300.9 610.6c-10-14.6-5-106 4.1-158.1 9.4-52.1 51-155.9 206.6-155.9S708.9 400.4 718 452.5c9.2 52.2 14.2 143.5 4.2 158.1z" />
					</Fragment>
				),
				tram: (
					<Fragment>
						<path d="M616.4 774.9H407.5s-88.4 75.4-88.4 89.2c0 13.9 18.6 32.8 27.2 31.7s29.7-37 39-40c9.2-3.1 126.6-3.9 126.6-3.9h.1s117.4.8 126.6 3.9c9.2 3.1 30.3 39 39 40 8.6 1.1 27.2-17.8 27.2-31.7 0-13.8-88.4-89.2-88.4-89.2zm-26.7 34c-2.7 6.3-77.7 4-77.7 4h-.1s-75 2.3-77.7-4c-2.7-6.3 34.2-32.7 34.2-32.7h87.2c-.1 0 36.8 26.4 34.1 32.7zM512 142.1s-101.6.4-107.3 9.8c-5.8 9.4 45.7 60.5 45.7 60.5s-7.5 29.2-31.9 7.9c-24.4-21.3-74-83.6-70.8-92.3 3.1-8.7 91.3-15.6 164.5-15.6s161.4 6.9 164.5 15.6-46.5 71-70.8 92.3-31.9-7.9-31.9-7.9 51.5-51.1 45.7-60.5c-6.2-9.4-107.7-9.8-107.7-9.8z" />
						<path d="M766.7 493.5c-2.2-84.8-19.5-175.8-46.3-236.7s-128.6-51.5-208.5-51.5-181.8-9.4-208.5 51.5-44.1 152-46.3 236.7c-2.2 84.8-20.3 248.2 14.7 264.6 34.9 16.2 189.6 18.9 240.1 18.9S717 774.3 752 758.1c34.9-16.4 16.8-179.9 14.7-264.6zM412.6 736.7c-26.7 0-48.3-21.7-48.3-48.3 0-26.7 21.7-48.3 48.3-48.3 26.6 0 48.3 21.7 48.3 48.3s-21.6 48.3-48.3 48.3zm198.7 0c-26.7 0-48.3-21.7-48.3-48.3 0-26.7 21.7-48.3 48.3-48.3 26.7 0 48.3 21.7 48.3 48.3.2 26.6-21.5 48.3-48.3 48.3zm111.3-151.4c-10 14.6-80.5 28.4-210.6 28.4s-200.6-13.8-210.6-28.4c-10-14.6-5-105.9 4.2-158 9.2-52.1 50.9-156 206.5-156s197.2 103.8 206.5 156c8.9 52.1 13.9 143.4 4 158z" />
					</Fragment>
				),
				train: (
					<Fragment>
						<path d="M617.5 751.6h-211s-89.4 76.2-89.4 90.2c0 14.1 18.8 33.2 27.5 32 8.7-1.2 30.1-37.3 39.3-40.5 9.2-3 127.9-4 127.9-4h.1s118.7.8 127.9 4c9.2 3 30.6 39.3 39.3 40.5 8.7 1.2 27.5-17.9 27.5-32 0-14-89.1-90.2-89.1-90.2zM590.6 786c-2.7 6.3-78.6 4-78.6 4h-.1s-75.9 2.3-78.6-4c-2.7-6.3 34.5-33 34.5-33H556c.1-.1 37.3 26.7 34.6 33z" />
						<path d="M777.8 380c-.3-112.2-9.1-196.8-20.2-210.7-11.1-13.8-106-19.3-245.6-19.3s-234.5 5.4-245.6 19.2c-11.1 13.8-19.9 98.6-20.2 210.7-.3 112.2 3.7 343.8 21 360.3S447 759.6 512 759.6s227.8-2.7 245-19.2 21.3-248.2 20.8-360.4zM369.9 699.9c-28.1 0-51-22.9-51-51s22.9-51 51-51 51 22.9 51 51c0 28.3-22.8 51-51 51zm284.1 0c-28.1 0-51-22.9-51-51s22.9-51 51-51 51 22.9 51 51c0 28.3-22.7 51-51 51zm46.9-323.1c-9 74.2-16.1 161.6-36.3 173.6-20.2 12.1-87.9 18.8-152.8 18.8s-132.5-6.7-152.8-18.8c-20.2-12.1-27.3-99.5-36.3-173.6s-15-133.1-1.4-146.7c13.6-13.6 90.7-7 190.3-7s176.8-6.6 190.3 7c14 13.6 8.1 72.5-1 146.7z" />
					</Fragment>
				),
				'coach-c': (
					<Fragment>
						<path d="M313.4 773.2c0 38-16.1 91.7 46.2 91.7s52-50.2 52-88.2m299-3.5c0 38 16.1 91.7-46.2 91.7-62.2 0-52-50.2-52-88.2" />
						<path d="M784.9 276.7c-3-30-3.4-80.5-18.6-97.6s-204.5-20-254.3-20-239.2 2.8-254.3 19.9c-15.2 17.1-15.6 67.7-18.6 97.6s-4 223.9-2.8 254.5c1.2 30.7 3.5 133.7 7 161.3 3.5 27.6 5.7 72.9 14.3 80.7 8.6 7.7 51.1 12.5 74.3 13.3 23.1.9 106.6 5.9 180.2 5.9s157-5.1 180.2-5.9c23.1-.9 65.7-5.6 74.3-13.3 8.6-7.7 10.7-53 14.3-80.7 3.5-27.6 5.7-130.6 7-161.3 1.2-30.6 0-224.5-3-254.4zM364 729c-28.1 0-50.8-22.7-50.8-50.8s22.7-50.8 50.8-50.8c28.1 0 50.8 22.7 50.8 50.8S392.1 729 364 729zm296 0c-28.1 0-50.8-22.7-50.8-50.8s22.7-50.8 50.8-50.8 50.8 22.7 50.8 50.8S688 729 660 729zm73.3-167.2c-10.5 15.3-84.5 29.8-221.3 29.8s-210.7-14.5-221.3-29.8c-10.5-15.3-5.3-111.3 4.3-166.1s53.6-164 217-164 207.3 109.1 216.9 163.9c9.6 54.8 14.9 150.8 4.4 166.2z" />
					</Fragment>
				),
				'coach-cc': (
					<Fragment>
						<path d="M313.4 773.2c0 38-16.1 91.7 46.2 91.7s52-50.2 52-88.2m299-3.5c0 38 16.1 91.7-46.2 91.7-62.2 0-52-50.2-52-88.2" />
						<path d="M784.9 276.7c-3-30-3.4-80.5-18.6-97.6s-204.5-20-254.3-20-239.2 2.8-254.3 19.9c-15.2 17.1-15.6 67.7-18.6 97.6s-4 223.9-2.8 254.5c1.2 30.7 3.5 133.7 7 161.3 3.5 27.6 5.7 72.9 14.3 80.7 8.6 7.7 51.1 12.5 74.3 13.3 23.1.9 106.6 5.9 180.2 5.9s157-5.1 180.2-5.9c23.1-.9 65.7-5.6 74.3-13.3 8.6-7.7 10.7-53 14.3-80.7 3.5-27.6 5.7-130.6 7-161.3 1.2-30.6 0-224.5-3-254.4zM364 729c-28.1 0-50.8-22.7-50.8-50.8s22.7-50.8 50.8-50.8c28.1 0 50.8 22.7 50.8 50.8S392.1 729 364 729zm296 0c-28.1 0-50.8-22.7-50.8-50.8s22.7-50.8 50.8-50.8 50.8 22.7 50.8 50.8S688 729 660 729zm73.3-167.2c-10.5 15.3-84.5 29.8-221.3 29.8s-210.7-14.5-221.3-29.8c-10.5-15.3-5.3-111.3 4.3-166.1s53.6-164 217-164 207.3 109.1 216.9 163.9c9.6 54.8 14.9 150.8 4.4 166.2z" />
					</Fragment>
				)
			}[type]}
		</svg>
	);
	
}
