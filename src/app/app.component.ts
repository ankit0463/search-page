import { Component } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as _ from 'lodash';
import * as musicResponse from './music.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings= {};
  searchText: any = '';
  resultIndexArray: any = [];
  resultArray: any = [];
  indexObject: any = {
    title: [],
    keywords: [],
    description: []
  };
  musicData: any = (musicResponse as any).default;


  constructor() {
  }

  ngOnInit(): void {
    this.dropdownList = [
      { item_id: 1, item_text: 'Title' },
      { item_id: 2, item_text: 'Description' },
      { item_id: 3, item_text: 'Keywords' }
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,
      allowSearchFilter: false
    };
  }
  title = 'search';

  onItemSelect(item: any) {
  }

  onSelectAll(items: any) {
  }

  getFormattedData(object: any) {
    this.resultArray = [];

    object.sections.forEach((element: any) => {
      element.assets.forEach((asset: any) => {
        let musicObj: any = {};
        let lyricsObj: any = {};
        asset.links.forEach((link: any) => {
          if (link.type === 'button' && !Object.keys(musicObj).length) {
            musicObj = link;
          }

          if (link.type === 'link' && !Object.keys(lyricsObj).length) {
            lyricsObj = link;
          }
        });

        const obj = {
          title: asset.title,
          runningTime: asset.supplement_information[0],
          description: asset.description[0],
          music: musicObj,
          lyrics: lyricsObj
        }

        this.resultArray.push(obj);
      });

    });
  }

  markText(value: String) {
    const newIndex = (value.toLowerCase()).indexOf(this.searchText.toLowerCase());
    const serachRegex = new RegExp(this.searchText, 'gi');
    return _.cloneDeep(value).replace( /(<([^>]+)>)/ig, '').replace(serachRegex, (match) => `<mark>${match}</mark>`)
  }

  getResults() {
    this.indexObject.title = [];
    this.indexObject.keywords = [];
    this.indexObject.description = [];
    this.resultIndexArray = [];
    const object = _.cloneDeep(this.musicData);
    if (this.searchText === '') {
      this.getFormattedData(_.cloneDeep(this.musicData));
      return;
    } else {
      object.sections.forEach((section: any) => {
        section.assets.forEach((value: any, index: any) => {
          value.keywords.every((key: any) => {
            if (key.toLowerCase().indexOf(this.searchText.toLowerCase()) !== -1 && this.indexObject.keywords.indexOf(index) === -1) {
              this.indexObject.keywords.push(index);
              return false;
            }
            return true;
          })
          const keyIndex = (value.title.replace( /(<([^>]+)>)/ig, '').toLowerCase()).indexOf(this.searchText.toLowerCase());
          if( keyIndex !== -1 && this.indexObject.title.indexOf(index) === -1) {
            value.title = this.markText(value.title);
            this.indexObject.title.push(index);
          }
          value.description.every((description: any, desIndex: any) => {
            const descIndex = description.replace( /(<([^>]+)>)/ig, '').toLowerCase().indexOf(this.searchText.toLowerCase());
            if ( descIndex !== -1 && this.indexObject.description.indexOf(index) === -1) {
              value.description[desIndex] = this.markText(description)
              this.indexObject.description.push(index);
              return false;
            }
            return true;
          })
        })

        if (this.selectedItems.length === 0) {
          this.resultIndexArray = [...this.indexObject.keywords, ...this.indexObject.title, ...this.indexObject.description];
          this.resultIndexArray = [...new Set(this.resultIndexArray)];
        } else if (this.selectedItems.length === 1) {
          const filterText = this.selectedItems[0].item_text.toLowerCase();
          this.resultIndexArray = this.indexObject[filterText];
        } else if (this.selectedItems.length === 2) {
          const filterText1 = this.selectedItems[0].item_text.toLowerCase();
          const filterText2 = this.selectedItems[1].item_text.toLowerCase();

          this.indexObject[filterText1].forEach((element: any) => {
            if(this.indexObject[filterText2].indexOf(element) !== -1 &&
              this.resultIndexArray.indexOf(element) === -1 ) {
                this.resultIndexArray.push(element)
            }
          });
        } else if (this.selectedItems.length === 3) {
          this.indexObject.title.forEach((element: any) => {
            if(this.indexObject.keywords.indexOf(element) !== -1 &&
              this.indexObject.description.indexOf(element) !== -1 &&
              this.resultIndexArray.indexOf(element) === -1 ) {
                this.resultIndexArray.push(element)
            }
          });
        }
      })
    }

    object.sections.forEach((element: any) => {
      const assetArray: any = [];
      element.assets.forEach((asset: any, index: any) => {
        if(this.resultIndexArray.indexOf(index) !== -1) {
          assetArray.push(asset);
        }
      });
      element.assets = [...assetArray];
    });

    this.getFormattedData(object);
  }
}

