/**
 * Multi-frame video view plugin
 *
 * This plugin synchronizes three video views to display a video with three frames:
 * -1 frame, 0 frame, and +1 frame.
 *
 * It also synchronizes the timeline labels to the 0 frame.
 */

async function initMultiFrameVideoView() {
	// Wait for the Label Studio Interface to be ready
	await LSI;

	// Get references to the video objects by their names
	const videoMinus1 = LSI.annotation.names.get("videoMinus1");
	const video0 = LSI.annotation.names.get("video0");
	const videoPlus1 = LSI.annotation.names.get("videoPlus1");

	if (!videoMinus1 || !video0 || !videoPlus1) return;

	// Convert frameRate to a number and ensure it's valid
	const frameRate = Number.parseFloat(video0.framerate) || 24;
	const frameDuration = 1 / frameRate;

	// Function to adjust video sync with offset and guard against endless loops
	function adjustVideoSync(video, offsetFrames) {
		video.isSyncing = false;

		for (const event of ["seek", "play", "pause"]) {
			video.syncHandlers.set(event, (data) => {
				if (!video.isSyncing) {
					video.isSyncing = true;

					if (video.ref.current && video !== video0) {
						const videoElem = video.ref.current;

						adjustedTime =
							(video0.ref.current.currentFrame + offsetFrames) * frameDuration;
						adjustedTime = Math.max(
							0,
							Math.min(adjustedTime, video.ref.current.duration),
						);

						if (data.playing) {
							if (!videoElem.playing) videoElem.play();
						} else {
							if (videoElem.playing) videoElem.pause();
						}

						if (data.speed) {
							video.speed = data.speed;
						}

						videoElem.currentTime = adjustedTime;
						if (
							Math.abs(videoElem.currentTime - adjustedTime) >
							frameDuration / 2
						) {
							videoElem.currentTime = adjustedTime;
						}
					}

					video.isSyncing = false;
				}
			});
		}
	}

	// Adjust offsets for each video
	adjustVideoSync(videoMinus1, -1);
	adjustVideoSync(videoPlus1, 1);
	adjustVideoSync(video0, 0);
}

// Initialize the plugin
initMultiFrameVideoView();
