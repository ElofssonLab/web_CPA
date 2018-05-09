from django.conf.urls import patterns, url

from web_pconsfold import views
urlpatterns = patterns('',
        url(r'(?P<pdb_id>[PF]{2}[0-9]{5}.[0-9]{1,2})/$', views.details, name='details'),
        url(r'help$', views.get_help, name='get_help'),
        url(r'news$', views.get_news, name='get_news'),
        url(r'download$', views.get_download, name='get_download'),
        url(r'reference$', views.get_reference, name='get_reference'),
        url(r'^$', views.index, name='index'),
        # url(r'^news/$', views.get_news, name='get_news'),
        )
