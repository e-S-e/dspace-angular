import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BitstreamDataService } from '../../../../core/data/bitstream-data.service';
import { BitstreamFormatDataService } from 'src/app/core/data/bitstream-format-data.service'; 
import { Observable } from 'rxjs';

import { Bitstream } from '../../../../core/shared/bitstream.model';
import { BitstreamFormat } from 'src/app/core/shared/bitstream-format.model';
import { Item } from '../../../../core/shared/item.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { hasValue } from '../../../../shared/empty.util';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/pagination/pagination.service';



declare var DjVu;

/**
 * This component renders the file section of the item
 * inside a 'ds-metadata-field-wrapper' component.
 */
@Component({
  selector: 'ds-item-page-file-section',
  templateUrl: './file-section.component.html'
})
export class FileSectionComponent implements OnInit {

  @Input() item: Item;

  label = 'item.page.files';

  separator = '<br/>';

  bitstreams$: BehaviorSubject<Bitstream[]>;

  originals$: Observable<RemoteData<PaginatedList<Bitstream>>>;

  format: any;

  currentPage: number;

  isLoading: boolean;

  isLastPage: boolean;

  bMetadata: any;

  pageSize = 5;

  
  viewer = new DjVu.Viewer();

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService,
    protected paginationService: PaginationService,
    protected bitstreamFormatDataService: BitstreamFormatDataService,
    protected modalService: NgbModal,
    config: NgbModalConfig
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  dViewer(BitstreamUrl,itemBitstream){
  
    this.bitstreamFormatDataService.findByBitstream(itemBitstream)
      .pipe(
        getFirstCompletedRemoteData(),
      )
      .subscribe((BitstreamFormatRD: RemoteData<BitstreamFormat>)=> {
        this.format = BitstreamFormatRD.payload.mimetype;
      });


      if(this.format == 'video/mp4'){
        document.getElementById('video').innerHTML += '<video controls><source src="'+BitstreamUrl+'" type="'+this.format+'"></video>';
      }else if(this.format == 'application/pdf'){
        document.getElementById('pdf').innerHTML += '<embed src="'+BitstreamUrl+'" width="500" height="375" type="'+this.format+'">';
      }else{
      
        this.viewer.render(document.getElementById('for_viewer')); 
        this.viewer.loadDocumentByUrl(BitstreamUrl);
        this.viewer.configure({
          uiOptions: {
            hideOpenAndCloseButtons: true,
            hideSaveButton: true,
            hidePrintButton: true
          }
        });
      }
  }
  

  info(iBitstream,dataBitstream): any{
    const modal = this.modalService.open(iBitstream);

    
    modal.componentInstance.bMetadata = dataBitstream.metadata;
  }

  ngOnInit(): void {
    this.getNextPage();
  }

  /**
   * This method will retrieve the next page of Bitstreams from the external BitstreamDataService call.
   * It'll retrieve the currentPage from the class variables and it'll add the next page of bitstreams with the
   * already existing one.
   * If the currentPage variable is undefined, we'll set it to 1 and retrieve the first page of Bitstreams
   */
  getNextPage(): void {
    this.isLoading = true;
    if (this.currentPage === undefined) {
      this.currentPage = 1;
      this.bitstreams$ = new BehaviorSubject([]);
    } else {
      this.currentPage++;
    }
    this.bitstreamDataService.findAllByItemAndBundleName(this.item, 'ORIGINAL', {
      currentPage: this.currentPage,
      elementsPerPage: this.pageSize
    }).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) => {
      if (bitstreamsRD.errorMessage) {
        this.notificationsService.error(this.translateService.get('file-section.error.header'), `${bitstreamsRD.statusCode} ${bitstreamsRD.errorMessage}`);
      } else if (hasValue(bitstreamsRD.payload)) {
        const current: Bitstream[] = this.bitstreams$.getValue();
        this.bitstreams$.next([...current, ...bitstreamsRD.payload.page]);
        this.isLoading = false;
        this.isLastPage = this.currentPage === bitstreamsRD.payload.totalPages;
      }
    });
  }
}
