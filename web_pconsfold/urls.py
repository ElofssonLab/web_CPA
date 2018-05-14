from django.conf.urls import patterns, url

from web_pconsfold import views
urlpatterns = patterns('',
        url(r'(?P<pdb_id>[PF]{2}[0-9]{5}.[0-9]{1,2})/$', views.details, name='details'),
        url(r'^browse$', views.get_browse, name='browse'),
        # url(r'^browse/([a-zA-Z0-9]{,20})', views.get_browse, name='browse'),
        url(r'^search$', views.get_search, name='search'),
        url(r'^help$', views.get_help, name='help'),
        url(r'^contact$', views.get_contact, name='contact'),
        url(r'^news$', views.get_news, name='news'),
        url(r'^download$', views.get_download, name='download'),
        url(r'^reference$', views.get_reference, name='reference'),
        url(r'^$', views.index, name='index'),
        # url(r'^news/$', views.get_news, name='get_news'),
        )
