import psutil
import time
import sys

# List of EXE names to kill EXACTLY
BLOCK_LIST = {
    "chrome.exe",
    "msedge.exe",
    "firefox.exe",
    "opera.exe",
    

    "cmd.exe",
    "powershell.exe",
    "chrome.exe"
    "discord.exe",
    "skype.exe",
    "whatsapp.exe",
    "telegram.exe",
    "teams.exe",
    "steam.exe",
    "notepad.exe"
}

def kill_blocked_processes():
    for proc in psutil.process_iter(["pid", "name"]):
        try:
            name = proc.info["name"]
            if name is None:
                continue

            # Compare names exactly
            if name.lower() in BLOCK_LIST:
                proc.kill()
                sys.stdout.write(f"Killed: {name}\n")
                sys.stdout.flush()

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

def main():
    print("Safe process killer running...")
    sys.stdout.flush()

    while True:
        kill_blocked_processes()
        time.sleep(0.3)   # fast and safe

if __name__ == "__main__":
    main()
