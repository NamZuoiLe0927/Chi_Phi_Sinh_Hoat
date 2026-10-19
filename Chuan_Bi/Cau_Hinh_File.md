your-project/
├── .claude/
│   ├── agents/          # agent definitions (who)
│   │   ├── analyst.md
│   │   ├── builder.md
│   │   └── qa.md
│   └── skills/          # skills (how) + one orchestrator (who-when-in-what-order)
│       ├── analyze/SKILL.md        # used by analyst (who: analyst.md)
│       ├── build/SKILL.md          # used by builder (who: builder.md)
│       ├── verify/SKILL.md         # used by qa (who: qa.md)
│       └── orchestrate/SKILL.md    # orchestrator coordinating the team
└── CLAUDE.md            # minimal pointer: trigger rule + change history