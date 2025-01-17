export function InitDND5() {
  //Сортировка списка навыков в алфавитном порядке
  async function sortSkillsAlpha() {
    const lists = document.getElementsByClassName("skills-list");
    for (let list of lists) {
      const competences = list.childNodes;
      let complist = [];
      for (let sk of competences) {
        if (sk.innerText && sk.tagName == "LI") {
          complist.push(sk);
        }
      }
      complist.sort(function (a, b) {
        return a.innerText.localeCompare(b.innerText);
      });
      for (let sk of complist) {
        list.appendChild(sk);
      }
    }
  }

  Hooks.on("renderActorSheet", async function () {
    sortSkillsAlpha();
  });

  // Выбор источника перевода
  game.settings.register("ru-ru", "altTranslation", {
    name: "Использовать альтернативный перевод",
    hint: "(Требуется модуль libWrapper) Использовать альтернативный перевод D&D5e от Phantom Studio. Иначе будет использоваться официальный перевод издательства Hobby World.",
    type: Boolean,
    default: false,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  // Настройка активации Babele
  game.settings.register("ru-ru", "compendiumTranslation", {
    name: "Перевод библиотек",
    hint: "(Требуется модуль Babele) Некоторые библиотеки системы D&D5e будут переведены.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });


  if (game.settings.get("ru-ru", "altTranslation")) {
    if (typeof libWrapper === "function") {
      libWrapper.register("ru-ru", "game.i18n._getTranslations", loadAltTranslation, "OVERRIDE");
    } else {
      new Dialog({
        title: "Альтернативный перевод",
        content: `<p>Для использования альтернативного перевода требуется активировать модуль <b>libWrapper</b>.</p>`,
        buttons: {
          done: {
            label: "Хорошо",
          },
        },
      }).render(true);
    }
  }

  async function loadAltTranslation() {
    const translations = {};
    const promises = [];
    const lang = "ru";

    // Include core supported translations
    if (CONST.CORE_SUPPORTED_LANGUAGES.includes(lang)) {
      promises.push(this._loadTranslationFile(`lang/${lang}.json`));
    }

    // Default module translations
    if (this.defaultModule !== "core" && game.modules?.has(this.defaultModule)) {
      const defaultModule = game.modules.get(this.defaultModule);
      this._filterLanguagePaths(defaultModule, lang).forEach((path) => {
        promises.push(this._loadTranslationFile(path));
      });
    }

    // Game system translations
    if (game.system) {
      this._filterLanguagePaths(game.system, lang).forEach((path) => {
        promises.push(this._loadTranslationFile(path));
      });
    }

    // Additional (non-default) module translations
    if (game.modules) {
      for (let module of game.modules.values()) {
        if (!module.active || module.id === this.defaultModule) continue;
        this._filterLanguagePaths(module, lang).forEach((path) => {
          promises.push(this._loadTranslationFile(path));
        });
      }
    }

    /// Alternative D&D5 translation
    promises.push(this._loadTranslationFile(`modules/ru-ru/i18n/systems/dnd5e-alt.json`));

    // Merge translations in load order and return the prepared dictionary
    await Promise.all(promises);
    for (let p of promises) {
      let json = await p;
      foundry.utils.mergeObject(translations, json, { inplace: true });
    }
    return translations;
  }

  // Регистрация Babele
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/dnd5e",
    });
  } else {
    if (game.settings.get("ru-ru", "compendiumTranslation")) {
      new Dialog({
        title: "Перевод библиотек",
        content: `<p>Для перевода библиотек системы D&D5 требуется установить и активировать модуль <b>Babele</b>. Вы можете отключить перевод библиотек в настройках модуля, чтобы это окно больше не отображалось.</p>`,
        buttons: {
          done: {
            label: "Хорошо",
          },
        },
      }).render(true);
    }
  }


}
