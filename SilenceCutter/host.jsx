/**
 * Host ExtendScript for communicating with Adobe Premiere Pro
 * Handles getting sequence info and applying cuts to timeline
 */

function getActiveSequenceInfo() {
    try {
        var app = new Object();
        if (typeof app !== "undefined" && app != null) {
            var project = app.project;
            if (project) {
                var sequence = project.activeSequence;
                if (sequence) {
                    var videoTracks = sequence.videoTracks;
                    var audioTracks = sequence.audioTracks;
                    var clipsInfo = [];
                    
                    // Get clips from first video track that has clips
                    for (var i = 1; i <= videoTracks.numTracks; i++) {
                        var track = videoTracks[i];
                        if (track.clips.numItems > 0) {
                            for (var j = 1; j <= track.clips.numItems; j++) {
                                var clip = track.clips[j];
                                var clipInfo = {
                                    name: clip.name,
                                    start: clip.start,
                                    end: clip.end,
                                    inPoint: clip.inPoint,
                                    outPoint: clip.outPoint,
                                    // For simplicity, we're using a placeholder path
                                    // In a real implementation, we'd need to get the actual file path
                                    path: "PLACEHOLDER_PATH"
                                };
                                clipsInfo.push(clipInfo);
                            }
                            break; // Just process first track with clips
                        }
                    }
                    
                    var sequenceInfo = {
                        name: sequence.name,
                        duration: sequence.duration,
                        width: sequence.width,
                        height: sequence.height,
                        clips: clipsInfo
                    };
                    
                    return JSON.stringify(sequenceInfo);
                }
            }
        }
        return "undefined";
    } catch (e) {
        return "Error: " + e.toString();
    }
}

function extractAndAnalyzeAudio(filePath, threshold, minDuration, padding) {
    try {
        // This function would typically launch the Node.js process
        // Since we can't directly call Node.js from ExtendScript in CEP,
        // we need to use the CSInterface to bridge to our Node.js backend
        // For now, we'll return a placeholder that indicates we need to call Node.js
        // The actual implementation will be handled in main.js via csInterface.evalScript
        // which will route to our Node.js process
        
        // In a real CEP plugin, we'd use:
        // var result = System.callSystem("node audioProcessor.js \"" + filePath + "\" " + threshold + " " + minDuration + " " + padding);
        // But since we're using CSInterface, the Node.js call is handled in main.js
        
        return JSON.stringify({success: false, error: "This function should be called from Node.js context"});
    } catch (e) {
        return JSON.stringify({success: false, error: e.toString()});
    }
}

function applyCutsToTimeline(segmentsJson) {
    try {
        var segments = JSON.parse(segmentsJson);
        var app = new Object();
        if (typeof app !== "undefined" && app != null) {
            var project = app.project;
            if (project) {
                var sequence = project.activeSequence;
                if (sequence) {
                    // Sort segments by start time (descending) to avoid issues with changing indices
                    segments.sort(function(a, b) {
                        return b.start - a.start;
                    });
                    
                    // Apply each cut
                    for (var i = 0; i < segments.length; i++) {
                        var segment = segments[i];
                        var startTime = segment.start;
                        var endTime = segment.end;
                        
                        // Find the clip at this position and split it
                        // This is simplified - real implementation would need to:
                        // 1. Find which clip contains this time range
                        // 2. Split the clip at startTime and endTime
                        // 3. Remove the middle segment
                        // 4. Apply ripple delete to close gaps
                        
                        // For now, we'll just log what we would do
                        $.writeln("Would cut from " + startTime + " to " + endTime);
                    }
                    
                    return "success";
                }
            }
        }
        return "Error: No active sequence";
    } catch (e) {
        return "Error applying cuts: " + e.toString();
    }
}