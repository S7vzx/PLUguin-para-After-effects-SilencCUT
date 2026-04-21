# Silence Cutter Plugin for Adobe Premiere Pro

A plugin that automatically detects and removes silent segments from video timelines in Adobe Premiere Pro.

## Features

- Detects silence in audio using FFmpeg's `silencedetect` filter
- Configurable silence threshold, minimum duration, and padding
- Applies intelligent cuts to the timeline with ripple delete
- Simple UI panel within Premiere Pro

## Installation

### 1. Install FFmpeg

The plugin requires FFmpeg to process audio. Install it using one of these methods:

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

**Windows:**
- Download FFmpeg from https://ffmpeg.org/download.html
- Extract the zip file
- Add the `bin` folder to your system PATH

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### 2. Install the Plugin

1. Copy the entire `SilenceCutter` folder to your CEP extensions directory:
   - **Windows:** `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
   - **macOS:** `/Library/Application Support/Adobe/CEP/extensions/`

2. Rename the folder to remove spaces (if present):
   - The folder should be named exactly: `SilenceCutter`

3. Launch or restart Adobe Premiere Pro

4. Access the plugin:
   - Go to `Window` > `Extensions` > `Silence Cutter`

### 3. Enable Developer Mode (if needed)

If the plugin doesn't load, you may need to enable developer mode:

**macOS:**
```bash
defaults write com.adobe.CSXS.6 PlayerDebugMode 1
```

**Windows:**
```reg
Add registry key: HKEY_CURRENT_USER\Software\Adobe\CSXS.6
Add value: PlayerDebugMode (REG_DWORD) = 1
```

## Usage

1. Open a project in Premiere Pro with a sequence containing video clips with audio
2. Select the sequence in the Timeline panel
3. Open the Silence Cutter panel (`Window` > `Extensions` > `Silence Cutter`)
4. Adjust settings if needed:
   - **Silence Threshold (dB):** Audio level below which is considered silence (default: -30dB)
   - **Min Silence Duration (s):** Minimum length of silence to detect (default: 0.5s)
   - **Padding (ms):** Time to add before/after detected silence to avoid cutting speech (default: 200ms)
5. Click "Analyze Silence" to process the audio
6. Review results in the panel
7. Click "Apply Cuts" to remove silent segments from the timeline

## How It Works

1. The plugin identifies the active sequence and its clips
2. Extracts audio from the first video clip (in this simplified version)
3. Uses FFmpeg with the `silencedetect` filter to analyze audio:
   ```
   ffmpeg -i input.wav -af silencedetect=n=-30dB:d=0.5 -f null -
   ```
4. Parses FFmpeg output to detect silent segments
5. Applies padding to avoid cutting speech
6. Uses ExtendScript to cut the timeline at detected silent regions
7. Applies ripple delete to close gaps

## Project Structure

```
SilenceCutter/
├── index.html          # Main UI
├── styles.css          # Styling
├── main.js             # Frontend logic
├── host.jsx            # ExtendScript for Premiere Pro communication
├── audioProcessor.js   # Node.js backend for FFmpeg processing
├── manifest.xml        # CEP extension manifest
└── README.md           # This file
```

## Notes

- This is a simplified implementation that processes the first clip in the first video track
- For production use, you would want to:
  - Process all clips in the sequence
  - Handle multiple video and audio tracks
  - Improve error handling and logging
  - Add preview functionality before applying cuts
  - Better integration with Premiere Pro's API to get actual file paths
- The plugin uses CEP (Common Extensibility Platform) to communicate between HTML/JS, ExtendScript, and Node.js

## Troubleshooting

- **"FFmpeg not found"**: Make sure FFmpeg is installed and in your system PATH
- **Plugin doesn't load**: Check that developer mode is enabled and the manifest.xml is valid
- **No cuts applied**: Verify that your sequence has audio and that silence detection is working
- **Errors in ExtendScript**: Check the ExtendScript Toolkit console for detailed error messages

## License

MIT