from django.conf.urls import include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    # Examples:
    url(r'^', include('web_CPA.urls', namespace='web_CPA')),
    # url(r'^$', include('web_CPA.urls', namespace='web_CPA')),
    # url(r'^help/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^news/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^reference/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^download/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^blog/', include('blog.urls')),
    url(r'^admin/', admin.site.urls),
]
