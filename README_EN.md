# DDL Manager

[简体中文](README.md) | **English**

## Version and requirements

- **Current version: v4.1.0** (also shown on the app's Contact page).
- **Operating system:** Windows 10 version 2004 or later / Windows 11.
- **Architecture:** 64-bit x64.
- **Runtime:** Microsoft WebView2. The recommended installer includes the full offline runtime installer. The portable edition requires WebView2 to be installed on your computer.
- **Installation location:** Any writable folder on C:, D:, E:, or another drive.

## Download and installation

### [Download the installer (recommended)](https://github.com/J0ey2ou/ddl-manager/releases/download/v4.1.0/DDLManager-v4.1.0-Setup-x64.exe)

[Download the portable ZIP](https://github.com/J0ey2ou/ddl-manager/releases/download/v4.1.0/DDLManager-v4.1.0-windows-x64.zip) · [All releases](https://github.com/J0ey2ou/ddl-manager/releases)

The recommended installer includes the full offline WebView2 installer. Download it, then double-click to install.

| File | When to use it |
| --- | --- |
| [**DDLManager-v4.1.0-Setup-x64.exe**](https://github.com/J0ey2ou/ddl-manager/releases/download/v4.1.0/DDLManager-v4.1.0-Setup-x64.exe) | Recommended. Includes the full Microsoft WebView2 offline installer. |
| [**DDLManager-v4.1.0-windows-x64.zip**](https://github.com/J0ey2ou/ddl-manager/releases/download/v4.1.0/DDLManager-v4.1.0-windows-x64.zip) | For computers with WebView2 installed. Extract the entire archive before running the app. |

1. Download and run the Setup file. Choose a writable folder on any supported drive. The default location is within the current Windows user's local application directory.
2. If WebView2 is missing, Setup installs the bundled runtime automatically.
3. Open DDL Manager from the desktop or Start menu. Create a local account on first use.
4. Enable the floating window, startup option, and shortcuts in Settings as needed.

Once downloaded, the installer works offline. Local schedules, recognition, statistics, and file-based schedule transfers do not require an internet connection. Microsoft To Do synchronization requires internet access.

For the portable edition, extract the entire ZIP and keep `DDLManager.exe`, `_internal`, and `fresh-install.flag` together. Do not run the app from inside the ZIP. **Code → Download ZIP** downloads this repository's documentation. The automatically generated **Source code (zip / tar.gz)** release archives are also not application installers. Use the download links above to install the software.

## New: local ChatGPT / Dot bridge (preview)

Enable the optional bridge in Settings to let Dot read, create, reschedule, complete, reopen, and delete local schedules through a custom MCP plugin. Subscribe to schedule changes and due reminders, with undo, retry deduplication, and revision conflict checks. Keep the computer, DDL, and official tunnel client running.

**Plugin installation, Tunnel configuration, and event subscriptions are required. Enabling the setting alone does not connect Dot. Real-account Dot notification delivery has not yet been verified end to end.** See [setup and limitations](DOT_SETUP.md).

## Features

Keep daily plans, classes, and deadlines together: review upcoming work on the home page, reschedule items in the calendar, organize your day on a timeline, and check progress from a desktop floating window. DDL Manager includes local text and image recognition, completion statistics, schedule transfers between computers, and Microsoft To Do synchronization.

### 1. Schedules and tasks

- **Deadlines:** Set a title, date, and time for each item. Remaining time, urgency colors, and progress bars help you see what needs attention.
- **Home page:** View tasks and all unfinished standalone schedule items in deadline order, including today's plans, future plans, and overdue items.
- **Categories:** Use automatic category suggestions, create custom categories, assign multiple categories, and filter your list.
- **Parent tasks and subtasks:** Break larger tasks into smaller steps and track their completion. A subtask's deadline cannot be later than its parent's deadline.
- **Recurring tasks:** Schedule daily, weekly, or monthly tasks.
- **Quick date presets:** Set deadlines using options such as tonight, tomorrow, the weekend, or next week.
- **Everyday actions:** Edit, delete, complete, and reopen items. Deadline tasks also support batch completion, deletion, and category changes.

### 2. Text, image, and timetable recognition

- **Chinese text parsing:** Split text into multiple items and recognize dates, common time expressions, numbered lists, and shared dates.
- **Image OCR:** Select or paste an image to recognize its text locally and preview the resulting items.
- **Timetable import:** Preview and adjust classes by semester start date, weekday, time slot, and teaching week, then import them together.
- **Review before adding:** Edit titles, times, and item types in the preview. Select the items to add; the list below updates immediately.
- **Clipboard shortcut:** Copy text or an image in another app, then open a separate recognition window using a shortcut, the system tray menu, or the floating window menu.

For example, enter this Chinese text:

```text
明天下午完成三件事：1.整理资料；2.准备演示；3.检查清单
```

It means “Complete three things tomorrow afternoon: organize materials, prepare a presentation, and check the checklist.” The app splits it into separate items with a shared date and time. You can edit the recognized results before adding them. Text parsing rules and OCR models are bundled with the app; no AI API is required, and images are processed locally rather than uploaded.

### 3. Calendar and drag scheduling

- The monthly calendar combines deadline tasks and schedule items, showing linked items without duplicates.
- Each date initially displays **three items** at a consistent cell height. Expand “N more items” to see the rest, then collapse it again.
- Drag an item to another date to reschedule it while preserving its time and the page's scroll position. A preview of the task bar follows the pointer, and the home page updates after the move.
- Filter by category, switch months, or return to the current month.
- Click a deadline task to edit it, or a schedule item to open its date. Date cells also show completion counts and holiday information.

### 4. Daily plans and timeline

- View a day's schedule, planning blocks, and tasks due that day in one place.
- Set start times, end times, and notes for plans, then view them on the daily timeline.
- Add items manually or create several at once with the quick parsing feature.
- Edit, complete, reopen, and delete items, with changes reflected on the home page, calendar, and statistics pages.

### 5. Completion records and statistics

- Distinguish unfinished, completed, overdue, completed-on-time, and completed-late items.
- Use `✓` to mark an item completed on time and `!` to mark it completed late. You can also record completion status for past items.
- View task counts, completion counts and rates, on-time rates, overdue counts, and efficiency scores.
- Compare annual and monthly results, category statistics, and progress on larger tasks.
- The completion heatmap uses actual completion dates. Statistics include standalone schedule items and avoid double-counting plans linked to deadline tasks.

### 6. Transfer schedules between computers

**Export schedules** and **Import schedules** appear above the Undo button at the bottom right of the home page. A short explanation appears on first use.

1. Sign in to your local account on computer A, choose Export schedules, and save a `.ddl.json` file.
2. Copy the file to computer B using a USB drive or another method of your choice.
3. Install DDL Manager and sign in to a local account on computer B. Choose Import schedules and select the file.
4. Review the numbers of new and matching items. For category conflicts, choose whether to keep the local category or use the imported one, then confirm.

**Matching and import rules:**

- **Same title and date:** Synchronize completion status and completion time from the file, including on-time completion, late completion, and reopening. Leading and trailing spaces in titles are ignored.
- **Other items:** Add them as new entries. Items found only on the receiving computer remain unchanged.
- **Category conflicts:** Resolve them individually in the confirmation dialog.
- **Repeated imports:** Importing the same file does not add duplicates. If multiple items share a title and date, matching prefers the same item type and exact time, then pairs entries individually.
- **Preserved content:** Existing items retain their local times, notes, and types. New entries carry their categories, notes, recurrence settings, history, and valid parent relationships. Linked plans are transferred with their deadline tasks. If a local parent has an earlier deadline, the imported subtask is kept as a standalone item.
- **Undo:** The home page updates after confirmation. Undo the entire import with “Undo: Import schedules.” Cancelling the preview leaves existing items unchanged.

Exports contain schedules for the current account, without login information or application settings. This is a manual file transfer feature; it does not connect to the internet automatically. Each file may be up to 10 MB and contain up to 10,000 items plus 10,000 linked plans.

### 7. Desktop floating window

- Display unfinished items, with up to three per page and paging controls.
- See titles, remaining or overdue time, and progress bars. Use `✓` for on-time completion, `!` for late completion, and `×` to delete.
- Drag the title or text area to move the window. Use `＋` to open a separate quick-add window.
- Place it at the left, right, or top edge of the screen to hide it automatically when the pointer leaves. Click the small tab to restore it.
- Right-click to open the main window, Settings, clipboard recognition, or the exit command. The menu closes when you interact with another window.
- Adjust size, opacity, and always-on-top behavior, with live slider previews.

### 8. Microsoft To Do synchronization

After signing in to your Microsoft account in Settings, you can synchronize local items **one way** to Microsoft To Do. The default destination list is `DDL Manager`.

- Run synchronization manually or enable automatic synchronization.
- Send new items, changes, and completion status. Source associations help avoid duplicate uploads.
- View the signed-in account, destination list, and cloud confirmation status. Synchronization does not delete cloud tasks.
- The first synchronization skips previously completed items. Microsoft authorization lasts for the current application session; authorize again after exiting.

This feature requires internet access. Changes made in Microsoft To Do do not synchronize back to DDL Manager. Other features remain available offline.

### 9. Undo, shortcuts, and background operation

- **Undo:** Retain the current account's 30 most recent undoable operations during the session, including schedule imports. Hiding the app in the tray preserves this history; fully exiting clears it.
- **System tray:** The main window's `X` button hides the app in the Windows tray. Double-click the tray icon to restore it, or right-click and choose Exit to close it completely.
- **Start with Windows:** Enable this in Settings to start in the tray when you sign in to Windows.
- **Single instance:** Launching the app again restores the existing window.
- **Local accounts:** Register, sign in, and switch between accounts.
- **Global shortcuts:** Customize them in Settings.

| Default shortcut | Action |
| --- | --- |
| `Ctrl + Alt + A` | Open the home page to add an item |
| `Ctrl + Alt + C` | Open the calendar |
| `Ctrl + Alt + T` | Open today's items |
| `Ctrl + Alt + D` | Show or hide the main window |
| `Ctrl + Alt + V` | Open the separate clipboard recognition window |

### 10. Appearance and personalization

- Choose background themes and urgency color modes, including fixed thresholds, dynamic ranges, and a hybrid mode.
- Manage quotes, their visibility, and which page modules are shown.
- Choose Chinese or English interface options.
- Set the floating window's size, opacity, and always-on-top behavior.
- Clean up old temporary cache files while retaining schedules and recognition models.

## Contact and collaboration

- **Author:** JOEy
- **Email:** [546263151@qq.com](mailto:546263151@qq.com)
- **GitHub:** [J0ey2ou](https://github.com/J0ey2ou)
- **Feedback and bug reports:** [GitHub Issues](https://github.com/J0ey2ou/ddl-manager/issues)

Feedback, feature suggestions, and collaboration on product design, development, and practical uses are welcome.

The current version is **v4.1.0**. This repository provides application releases and usage documentation.
