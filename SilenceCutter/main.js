const csInterface = new CSInterface();
let silentSegments = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('analyzeBtn').addEventListener('click', analyzeSilence);
    document.getElementById('applyBtn').addEventListener('click', applyCuts);
    document.getElementById('previewBtn').addEventListener('click', previewCuts);
});

function analyzeSilence() {
    const threshold = document.getElementById('silenceThreshold').value;
    const minDuration = document.getElementById('minDuration').value;
    const padding = document.getElementById('padding').value;
    
    // Show progress
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('progressText').textContent = 'Analyzing audio...';
    document.getElementById('progressFill').style.width = '0%';
    
    // Send request to host.jsx to get active sequence and clips
    csInterface.evalScript('getActiveSequenceInfo()', function(result) {
        if (result && result !== 'undefined') {
            const sequenceInfo = JSON.parse(result);
            // Now request audio analysis for each clip
            analyzeClipAudio(sequenceInfo, threshold, minDuration, padding);
        } else {
            showError('No active sequence found');
        }
    });
}

function analyzeClipAudio(sequenceInfo, threshold, minDuration, padding) {
    // For simplicity, we'll process the first video track's first clip
    // In a full implementation, we'd iterate through all clips
    if (sequenceInfo.clips && sequenceInfo.clips.length > 0) {
        const clip = sequenceInfo.clips[0];
        document.getElementById('progressText').textContent = `Analyzing ${clip.name}...`;
        
        // Request audio extraction and analysis from Node.js backend
        csInterface.evalScript(`extractAndAnalyzeAudio('${clip.path}', ${threshold}, ${minDuration}, ${padding})`, function(result) {
            if (result && result !== 'undefined') {
                const analysisResult = JSON.parse(result);
                if (analysisResult.success) {
                    silentSegments = analysisResult.segments;
                    showResults(silentSegments.length);
                } else {
                    showError('Audio analysis failed: ' + analysisResult.error);
                }
            } else {
                showError('No response from audio processor');
            }
        });
    } else {
        showError('No clips found in sequence');
    }
}

function showResults(count) {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';
    document.getElementById('silenceCount').textContent = count;
    document.getElementById('applyBtn').disabled = count === 0;
}

function applyCuts() {
    if (silentSegments.length === 0) return;
    
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('progressText').textContent = 'Applying cuts...';
    document.getElementById('progressFill').style.width = '50%';
    
    // Send segments to host.jsx to apply cuts
    const segmentsJson = JSON.stringify(silentSegments);
    csInterface.evalScript(`applyCutsToTimeline(${segmentsJson})`, function(result) {
        document.getElementById('progressFill').style.width = '100%';
        setTimeout(() => {
            document.getElementById('progressContainer').style.display = 'none';
            if (result && result === 'success') {
                alert('Cuts applied successfully!');
                document.getElementById('resultsContainer').style.display = 'none';
                document.getElementById('applyBtn').disabled = true;
            } else {
                showError('Failed to apply cuts: ' + result);
            }
        }, 500);
    });
}

function previewCuts() {
    // In a full implementation, this would show a preview without applying
    alert('Preview feature would show what would be cut without making changes');
}

function showError(message) {
    document.getElementById('progressContainer').style.display = 'none';
    alert('Error: ' + message);
    console.error(message);
}