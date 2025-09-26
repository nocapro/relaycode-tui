help screen

1. update the help screen
2. we want borderless UI

===

splash screen:

1. add random tips infos like `ctrl + v to manual paste in anyscreen`
2. add something like check for update notification
3. increase splash duration from 3 second to six seconds

=== DONE

add cool animations to splash screen, initialization screes, dashboard screens.

=== DONE

direct console.log statements interfering with the Ink renderer

so we need notification screen that certain action is successful or failed. comes with further guidance for user.

it should also auto dissapear on countdown

should show notification screen after certain action like transaction history bulk copy action etc necessary actions areas

dont forget to add to debug menu for any new screen state

=== DONE

on every screen, when user paste the patches manually using ctrl+v, it should process. even the listening is paused

=== DONE

review screen: from processing screen upto review screen, the
data should be the same.

==== DONE

review processing screen:

1. we need the elapsed time is animated not static or not only refresh at certain event.

2. individual files processing should also has indicator which progressing and done, because the process is parallel

dont forget to update docs/relaycode-tui/review-processing-screen.readme.md for ui changes

=== DONE

1. transaction history screen and transaction detail screen

add feature , so user can open transaction yaml file or files in their ide editor

2. dont forget to add to debug menu for any new screen state

3. dont forget to update readme if you have updated design

=== DONE

transaction detail screen and review screen

the reasoning view should one column, so vertically spread text with scrollable nav

===

  add feature for user to view/edit system prompt, prompts, config file... so now we need

  file-editor-screen

  dont forget to add to debug menu for any new screen state

=== DONE

we already have debug menu of ctrl+b, now we want more screen named debug log (ctrl+l) so user can know the system debug log of what system activities behind is happening, so user has knowledge like why certain clipboard not detected etc

so I also think we need multi level logger utils and implement to necessary areas

dont forget to add screen to debug menu to let user go to log debug screen and see simulated activities being happening there

===

should dim another layout area when screen is asking for user action like what to copy, confirmation, etc

===

on terminal widht height size changes, UI should be responsive. so not appear broken

=== DONE

1. add copy context feature to advanced copy of below screen

transaction history screen, transaction detail screen, review screen .

so context feature is useful for user to get latest files content as parsable markdown format the same file as the transaction point

2. dont forget to add to debug menu for any new screen state

3. dont forget to update readme if you have updated design

=== DONE

responsive view of action buttons like

(↑↓) Nav · (Enter) Review · (L)og · (A)pprove All ·
(C)ommit All · (P)ause · (Q)uit

should aware of terminal widht so know when to render as horizontal spread and vertical spread

=== DONE

review screen

1. on certain file patch failed user has options to repair or bulk repair.. I want on certain file patch rejected user should has options to `something` or bulk `something` so they can also get another clipboard to paste to llm and relaycode waiting for new patch for that particular.

2. dont forget to add to debug menu for any new screen state

3. dont forget to update readme if you have updated design

=== DONE

1. dashboard screen:

- remove - in timeago

- add empty state of event stream screen to debug menu

- just like transaction history screen, event stream item should also have drilling arrow left right feature to see useful stats, files, also actions can be take by user. only one event stream item can be expanded

2. dont forget to add to debug menu for any new screen state

3. dont forget to update readme if you have updated design

=== DONE

1. update review screen

- we need more colors

- beside click D, click enter also show the diff

- navigating up down is a bit hustle, I think two active area switching is the problem

- header stats should be the total aggregation, not individual item

- add arrow down up navigation for bulk repair action option item


3. dont forget to add to debug menu for any new screen state

4. dont forget to update readme if you have updated design

=== DONE

1. update transaction history screen

- should also can drilling prompt, reasoning, full commit message

- checkbox should only appear while user select at least one item

- show useful status stats to header


- we need loading indicator spinner while user drilling loads something like load diffs etc


3. dont forget to add to debug menu for any new screen state

4. dont forget to update readme if you have updated design


=== DONE

- should streamline the esc and quit behaviour accross screen for consistency

- implement drilling left right arrow just like transaction history screen

=== DONE

make sure the screens flows all connected, like navigation to another screens is working, etc

===

extract out all content strings,urls to content/[entity].content.ts files for easier UI strings/copywriting management

=== DONE

extract out all constants to constants/[domain].constants.ts files

===

do DRYness refactor radically to eliminate redundancy. but first analyse the priority areas and pick that one area to solve in one attempt at a time

redundancy is like something below

interface HistoryTransaction and interface Transaction. where as entity basically its Transaction thats need to be backward addressed accross UI, hook, State, store, data, type

do not think about backward compability, it cause code boat.

dont forget final step yaml in fenced codeblock


--------------

```json
[
  "src/types/transaction.types.ts",
  "src/data/mocks.ts",
  "src/stores/dashboard.store.ts",
  "src/stores/transaction-history.store.ts",
  "src/stores/transaction-detail.store.ts",
  "src/components/DashboardScreen.tsx",
  "src/components/TransactionHistoryScreen.tsx",
  "src/hooks/useTransactionHistoryScreen.tsx",
  "src/components/TransactionDetailScreen.tsx"
]
```

### Reasoning

The most significant area of redundancy is the split between `Transaction` and `HistoryTransaction` types. They represent the same core entity but are defined and used separately, leading to duplicated logic and potential inconsistencies.

The refactor should focus on creating a single, unified `Transaction` entity.

1.  **`src/types/transaction.types.ts`**: This is the source of truth. The `Transaction` and `HistoryTransaction` interfaces should be merged into a single `Transaction` type. The `TransactionStatus` and `HistoryTransactionStatus` enums should also be unified into one.
2.  **`src/data/mocks.ts`**: The mock data generation functions (`createDashboardTransactions`, `createMockHistoryTransactions`) must be updated to produce instances of the new unified `Transaction` object, using the standardized status enum.
3.  **`src/stores/*.store.ts`**: The stores for the dashboard, history, and detail views are the primary state managers for these entities. They must be updated to use the single `Transaction` type instead of their specialized versions.
4.  **`src/components/*.tsx` & `src/hooks/*.tsx`**: The components (`DashboardScreen`, `TransactionHistoryScreen`, `TransactionDetailScreen`) and the corresponding hook for the most complex screen (`useTransactionHistoryScreen`) directly render and process these objects. They need to be modified to handle the new unified structure and status values (e.g., updating `getStatusIcon` or status maps from `'Committed'` to `'COMMITTED'`).


------

do DRYness refactor radically to eliminate redundancy and prevent data integrity compromise.

addressed accross UI, hook, State, store, data, type

rules;
1. do not think about backward compability, it cause code boat.
2. do not cause UI shift

dont forget final step yaml in fenced codeblock


=== DONE

1. extract out all types to types/[entitiy].type.ts files
2. implement types.ts files to necessary areas for DRYness

give me transaction in four phase, now please go on for first phase

dont forget final step yaml in fenced codeblock

===

traditional methods should HOF, no classes, no OOP.

=== DONE

tsx files only for renders so please extract out all simulated backend logic to [entity].service.ts files

so service files should only concern about business logic, not UI state or logic

give me transaction in four phase, now please go on for first phase

dont forget final step yaml

=== DONE

tsx files only for renders, so please extract out all hooks to [entity].hook.tsx files.

give me transaction in two phase, now please go on for first phase

dont forget final step yaml

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
