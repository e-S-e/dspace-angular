import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { TruncatableComponent } from './truncatable.component';
import { TruncatableService } from './truncatable.service';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TruncatableComponent', () => {
  let comp: TruncatableComponent;
  let fixture: ComponentFixture<TruncatableComponent>;
  const identifier = '1234567890';
  let truncatableService;
  const truncatableServiceStub: any = {
    /* tslint:disable:no-empty */
    isCollapsed: (id: string) => {
      if (id === '1') {
        return Observable.of(true)
      } else {
        return Observable.of(false);
      }
    },
    expand: (id: string) => {
    },
    collapse: (id: string) => {
    },
    toggle: (id: string) => {
    }
    /* tslint:enable:no-empty */
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [TruncatableComponent],
      providers: [
        { provide: TruncatableService, useValue: truncatableServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(TruncatableComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(TruncatableComponent);
    comp = fixture.componentInstance; // TruncatableComponent test instance
    comp.id = identifier;
    fixture.detectChanges();
    truncatableService = (comp as any).service;
  });

  describe('When the item is hoverable', () => {
    beforeEach(() => {
      comp.onHover = true;
      fixture.detectChanges();
    })
    ;

    it('should call collapse on the TruncatableService', () => {
      spyOn(truncatableService, 'collapse');
      comp.hoverCollapse();
      expect(truncatableService.collapse).toHaveBeenCalledWith(identifier);
    });

    it('should call expand on the TruncatableService', () => {
      spyOn(truncatableService, 'expand');
      comp.hoverExpand();
      expect(truncatableService.expand).toHaveBeenCalledWith(identifier);
    });
  });

  describe('When the item is not hoverable', () => {
    beforeEach(() => {
      comp.onHover = false;
      fixture.detectChanges();
    })
    ;

    it('should not call collapse on the TruncatableService', () => {
      spyOn(truncatableService, 'collapse');
      comp.hoverCollapse();
      expect(truncatableService.collapse).not.toHaveBeenCalled();
    });

    it('should not call expand on the TruncatableService', () => {
      spyOn(truncatableService, 'expand');
      comp.hoverExpand();
      expect(truncatableService.expand).not.toHaveBeenCalled();
    });
  });

  describe('When toggle is called', () => {
    beforeEach(() => {
      spyOn(truncatableService, 'toggle');
      comp.toggle();
    });

    it('should call toggle on the TruncatableService', () => {
      expect(truncatableService.toggle).toHaveBeenCalledWith(identifier);
    });
  });

});