import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APIPage } from './api.page';

describe('APIPage', () => {
  let component: APIPage;
  let fixture: ComponentFixture<APIPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(APIPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
