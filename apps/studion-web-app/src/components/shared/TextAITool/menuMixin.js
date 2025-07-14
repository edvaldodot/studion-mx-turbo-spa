export default {
  data() {
    return {
      menuItems: [
        {
          title: null,
          items: [
            {
              text: 'mediation.actions:ia.menu.undo',
              icon: 'undo-2',
              action: 'Undo',
            },
          ],
        },
        {
          title: 'mediation.actions:ia.menu.title.write',
          items: [
            {
              text: 'mediation.actions:ia.menu.generate',
              icon: 'ia-editnote-a',
              action: 'GenerateMessage',
            },
          ],
        },
        {
          title: 'mediation.actions:ia.menu.title.edit',
          items: [
            {
              text: 'mediation.actions:ia.menu.improve',
              icon: 'ia-improve',
              action: 'EnhanceWriting',
            },
            {
              text: 'mediation.actions:ia.menu.spellcheck',
              icon: 'ia-spellcheck',
              action: 'CorrectGrammar',
            },
            {
              text: 'mediation.actions:ia.menu.tone',
              icon: 'ia-tone',
              subitems: [
                {
                  text: 'mediation.actions:ia.menu.tone.professional',
                  action: 'AlterToneProfessional',
                },
                {
                  text: 'mediation.actions:ia.menu.tone.casual',
                  action: 'AlterToneCasual',
                },
                {
                  text: 'mediation.actions:ia.menu.tone.friendly',
                  action: 'AlterToneFriendly',
                },
              ],
            },
            {
              text: 'mediation.actions:ia.menu.longer',
              icon: 'ia-editnote-b',
              action: 'ExtendContent',
            },
            {
              text: 'mediation.actions:ia.menu.shorter',
              icon: 'ia-editnote-c',
              action: 'ShortenContent',
            },
          ],
        },
      ],
    }
  },
}
