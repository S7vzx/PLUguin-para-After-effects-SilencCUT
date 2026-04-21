const { spawn } = require('child_process');
const path = require('path');

// This script would be called from the Node.js backend in a CEP plugin
// It processes audio files using FFmpeg's silencedetect filter

function analyzeAudio(filePath, threshold, minDuration, padding) {
    return new Promise((resolve, reject) => {
        // Convert padding from ms to seconds for FFmpeg
        const paddingSec = padding / 1000;
        
        // Build FFmpeg command with silencedetect filter
        // Using -f null - to discard output, we only want the stderr output which contains the silencedetect results
        const ffmpegArgs = [
            '-i', `"${filePath}"`,
            '-af', `silencedetect=n=${threshold}dB:d=${minDuration}`,
            '-f', 'null',
            '-'
        ];
        
        // For debugging
        console.log(`Running FFmpeg: ffmpeg ${ffmpegArgs.join(' ')}`);
        
        const ffmpeg = spawn('ffmpeg', ffmpegArgs, { 
            shell: true, 
            windowsHide: true 
        });
        
        let stderrData = '';
        let silentSegments = [];
        
        ffmpeg.stderr.on('data', (data) => {
            stderrData += data.toString();
        });
        
        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`FFmpeg process exited with code ${code}`));
                return;
            }
            
            // Parse FFmpeg output to detect silence segments
            // Example output lines:
            // [silencedetect @ 0x7f9ec3805600] silence_start: 0
            // [silencedetect @ 0x7f9ec3805600] silence_end: 3.2 | silence_duration: 3.2
            const lines = stderrData.split('\n');
            let silenceStart = null;
            
            for (const line of lines) {
                if (line.includes('silencedetect') && line.includes('silence_start')) {
                    const match = line.match(/silence_start: (\d+\.?\d*)/);
                    if (match) {
                        silenceStart = parseFloat(match[1]);
                    }
                } else if (line.includes('silencedetect') && line.includes('silence_end')) {
                    const startMatch = line.match(/silence_end: (\d+\.?\d*)/);
                    const durationMatch = line.match(/silence_duration: (\d+\.?\d*)/);
                    
                    if (startMatch && durationMatch) {
                        const silenceEnd = parseFloat(startMatch[1]);
                        const silenceDuration = parseFloat(durationMatch[1]);
                        
                        // Apply padding
                        const paddedStart = Math.max(0, silenceStart - paddingSec);
                        const paddedEnd = silenceEnd + paddingSec;
                        
                        silentSegments.push({
                            start: paddedStart,
                            end: paddedEnd,
                            originalStart: silenceStart,
                            originalEnd: silenceEnd,
                            duration: silenceDuration
                        });
                        
                        silenceStart = null; // Reset for next detection
                    }
                }
            }
            
            resolve({
                success: true,
                segments: silentSegments
            });
        });
        
        ffmpeg.on('error', (err) => {
            reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
        });
    });
}

// This function would be called from the CEP extension's Node.js backend
// For demonstration, we're exporting the function
module.exports = {
    analyzeAudio: analyzeAudio
};

// If this script is run directly (for testing)
if (require.main === module) {
    const [, , filePath, threshold, minDuration, padding] = process.argv;
    
    if (!filePath) {
        console.error('Usage: node audioProcessor.js <filePath> [threshold] [minDuration] [padding]');
        process.exit(1);
    }
    
    analyzeAudio(
        filePath,
        parseFloat(threshold) || -30,
        parseFloat(minDuration) || 0.5,
        parseFloat(padding) || 200
    )
    .then(result => {
        console.log(JSON.stringify(result));
    })
    .catch(err => {
        console.error(JSON.stringify({success: false, error: err.message}));
        process.exit(1);
    });
}