import { Component, signal, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Website {
  id: string;
  name: string;
  url: string;
}

const STORAGE_KEY = 'geek_launcher_sites';

const DEFAULT_SITES: Website[] = [
  { id: '1', name: 'Gemini', url: 'https://gemini.google.com' },
  { id: '2', name: 'DeepSeek', url: 'https://chat.deepseek.com' },
  { id: '3', name: 'ChatGPT', url: 'https://chat.openai.com' },
  { id: '4', name: 'Cloudflare', url: 'https://dash.cloudflare.com' },
  { id: '5', name: '同花顺', url: 'https://www.10jqka.com.cn' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // State for the list of websites
  sites = signal<Website[]>([]);

  // State for the new site form
  newName = signal('');
  newUrl = signal('');
  
  // UI State
  isAdding = signal(false);

  constructor() {
    this.loadSites();
  }

  // Load sites from localStorage or set defaults
  private loadSites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.sites.set(JSON.parse(stored));
      } else {
        // Initialize with default geek list if empty
        this.sites.set([...DEFAULT_SITES]);
        this.saveSites();
      }
    } catch (e) {
      console.error('Failed to load sites', e);
      this.sites.set([...DEFAULT_SITES]);
    }
  }

  // Persist current state to localStorage
  private saveSites() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sites()));
  }

  // Add a new website
  addSite() {
    const name = this.newName().trim();
    let url = this.newUrl().trim();

    if (!name || !url) {
      alert('Please fill in both Name and URL');
      return;
    }

    // Basic URL fix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newSite: Website = {
      id: Date.now().toString(),
      name,
      url
    };

    this.sites.update(current => [...current, newSite]);
    this.saveSites();
    
    // Reset form
    this.newName.set('');
    this.newUrl.set('');
    this.isAdding.set(false);
  }

  // Delete a website
  deleteSite(id: string, event: Event) {
    event.stopPropagation(); // Prevent triggering the card click
    if (confirm('Remove this website?')) {
      this.sites.update(current => current.filter(s => s.id !== id));
      this.saveSites();
    }
  }

  // Helper for favicon
  getFavicon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return 'https://www.google.com/s2/favicons?domain=google.com&sz=64'; // Fallback
    }
  }

  // Handle Input Changes (Helper for template)
  updateName(event: Event) {
    this.newName.set((event.target as HTMLInputElement).value);
  }

  updateUrl(event: Event) {
    this.newUrl.set((event.target as HTMLInputElement).value);
  }

  toggleAddMode() {
    this.isAdding.update(v => !v);
  }

  navigateTo(url: string) {
    window.open(url, '_blank');
  }
}
