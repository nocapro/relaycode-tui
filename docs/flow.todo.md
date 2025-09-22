transaction history screen and transaction detail screen

add feature , open transaction yaml file or files in their ide editor

===

transaction detail screen and review screen

the reasoning view should one column, so vertically spread text with scrollable nav

===

dashboard screen

show keystroke for user to view/edit system prompt, config file... so now we need

file-editor-screen

===

beside debug menu of ctrl+b we want more screen named debug log so user can know the system debug log of what system activities behind is happening, so user has knowledge like why certain clipboard not detected etc

===

should dim another layout area when screen is asking for user action like what to copy, confirmation, etc

===

on terminal widht height size changes, UI should be responsive. so not appear broken

===

add copy context feature to advanced copy of below screen

transaction history screen, transaction detail screen, review screen .

so context feature is useful for user to get latest files content as parsable markdown format the same file as the transaction point

===

responsive view of action buttons like

(↑↓) Nav · (Enter) Review · (L)og · (A)pprove All ·
(C)ommit All · (P)ause · (Q)uit

should aware of terminal widht so know when to render as horizontal spread and vertical spread

===

review screen

on certain file patch failed user has options to repair or bulk repair.. I want on certain file patch rejected user should has options to `something` or bulk `something` so they can also get another clipboard to paste to llm and relaycode waiting for new patch for that particular.

===

dashboard screen:

- remove - in timeago

- add empty state of event stream screen to debug menu

- just like transaction history screen, event stream item should also have drilling arrow left right feature to see useful stats, files, also actions can be take by user. only one event stream item can be expanded

===

update review screen

- we need more colors

- beside click D, click enter also show the diff

- navigating up down is a bit hustle, I think two active area switching is the problem

- header stats should be the total aggregation, not individual item

- add arrow down up navigation for bulk repair action option item

===

update transaction history screen

- should also can drilling prompt, reasoning, full commit message

- checkbox should only appear while user select at least one item

- show useful status stats to header


- we need loading indicator spinner while user drilling loads something like load diffs etc

===

- should streamline the esc and quit behaviour accross screen for consistency

- implement drilling left righ arrow

===

make sure the screens flows all connected, like navigation to another screens is working, etc

===

tsx files only for renders so please extract out all simulated backend logic to [entity].service.ts files

===

tsx files only for renders, so please extract out all hooks to [entity].hook.tsx files.

give me transaction in two phase, now please go on for first phase

===

 implement dynamically creating a scrollable viewport based on the terminal size to more screens and areas

dont forget final checks yaml

=== DONE

paginated scroll for more list not working on transaction-history-screen and dashboard screen

=== DONE

based on      "docs/relaycode-tui/transaction-history-screen.readme.md"

1. create the transaction-history-screen, focus on prototyping simulation, not thinking about core backend logic

2. make sure there is keystroke in dashboard that open transaction-history-screen also on scrolling down bottom of event stream, should automatically go to transaction-history-screen

3. dont forget to add to debug menu

4. dont forget to update readme if you have updated design


=== DONE

add numbering list keystroke for debug menu so beside up down navigation, user can directly hit keyboard

=== DONE

add feature about debug menu where run terminal command like `bun start debug-screen [screen-file-name]` example `bun start debug-screen TransactionDetailScreen.tsx` should directly open the screen , so AI agent can debug the screen whether it is successful renders or not of has UI problems or something

=== DONE

based on     "docs/relaycode-tui/transaction-detail-screen.readme.md"

1. create the transaction-detail-screen, focus on prototyping simulation, not thinking about core backend logic

2. dont forget to add to debug menu

3. dont forget to update docs/relaycode-tui/review-screen.readme.md if you have updated design

=== DONE

based on docs/relaycode-tui/git-commit-screen.readme.md

create the git-commit-screen, focus on prototyping simulation, not thinking about core backend logic

dont forget to add to debug menu

=== DONE

review screen current layout, UI, UX not identical to readme

1. make current implementation design to follow docs/relaycode-tui/review-screen.readme.md
3. also add states that has not been implemented
2. add more list of review screen states to debugmenu

dont forget to update docs/relaycode-tui/review-screen.readme.md if you have updated design

=== DONE

create screen list menu screen with state. which can be open from any screen by pressing ctrl+s

so this screen list to debug UI and state and workflow and can be navigated by programmer to directly access any screen with any state as simulation

=== DONE

based on

docs/relaycode-tui/review-screen.readme.md
docs/relaycode-tui/review-processing-screen.readme.md

extract out the processing state screen from review screen to review processing screen

make sure the layout, UI UX is identical to readme

=== DONE

review screen: user need to see the simulation screen state flow of processing patches

===

review screen current layout, UI, UX not identical to readme

1. make current implementation comply docs/relaycode-tui/review-screen.readme.md
2. reject all should not by ESC, esc only back to dashboard

dont forget to update docs/relaycode-tui/review-screen.readme.md if you have updated design

=== DONE

create the review-screen diff-screen screen and reason screen, focus on prototyping simulation, not thinking about core backend logic

=== DONE

we need elegant colors on screens

=== DONE

create the dasboard and global help screen, focus on prototyping simulation, not thinking about core backend logic
