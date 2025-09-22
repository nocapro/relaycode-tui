===

tsx files only for renders, so please extract out all hooks to [entity].hook.tsx files

===

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
