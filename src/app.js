import { AavPage } from './pages/aav.js';
import { MissionsPage } from './pages/missions.js';

export class App {
  currentPage = null;

  constructor() {
    this.initNewPage();

    const _pushState = history.pushState;
    history.pushState = (...args) => {
      _pushState.apply(history, args);

      this.destroyCurrentPage();
      this.initNewPage();
    };

    window.addEventListener('popstate', () => {
      this.destroyCurrentPage();
      this.initNewPage();
    });
  }

  destroyCurrentPage() {
    if (this.currentPage !== null) {
      this.currentPage.destroy();
      this.currentPage = null;
    }
  }

  initNewPage() {
    if (location.href.endsWith('missions')) {
      this.currentPage = new MissionsPage();
    } else if (location.href.endsWith('aav')) {
      this.currentPage = new AavPage();
    }
  }
}
